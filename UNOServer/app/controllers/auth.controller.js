const db = require("../models");
const config = require("../config/auth.config");
const User = db.users;
const Role = db.roles;
const Class = db.classes;
const ClassUser = db.classusers;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signupStudent = (req, res) => {
  if (
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.class_code
  ) {
    res.status(400).send({
      message:
        "Error. first_name, last_name, email, password and class_code body parameters are required.",
    });
    return;
  }

  const class_code = req.body.class_code;

  // Check if Class code exists
  Class.findOne({
    where: {
      code: class_code,
    },
  })
    .then((class_entry) => {
      console.log(class_entry);
      if (class_entry) {

        const newUser = {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
        };

        // Save User to Database
        User.create(newUser).then((user) => {
          // Set student Role
          user.setRoles([1]).then(() => {
            // Assign user to class
            ClassUser.create({
              UserId: user.id,
              ClassId: class_entry.id,
              user_type: "student",
            }).then(async () => {

              // Create Notification topic arn
              try {
                // create SNS topic with a unique name
                const topicName = `${process.env.NODE_ENV}-user-${user.id}-notifications`;
                const createTopicResult = await req.sns.createTopic({ Name: topicName }).promise();
                const topicArn = createTopicResult.TopicArn;
            
                // update the user's record in the database with the new SNS topic ARN
                await User.update({ notification_topic_arn: topicArn }, { where: { id: user.id } });
            
                res.send({ message: "User was registered successfully!" });
              } catch (error) {
                res.status(500).send({ message: error.message });
              }
            });
          });
        });
      } else {
        res.status(400).send({ message: "Invalid class code." });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signupTeacher = (req, res) => {
  const newUser = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  };

  // Save User to Database
  User.create(newUser)
    .then((user) => {
      // Set teacher Role
      user.setRoles([2]).then(() => {
        res.send({ message: "User was registered successfully!" });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      let token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      user.getRoles().then((roles) => {
        req.session.token = token;
        
        if (roles[0].name === "student") {
          ClassUser.findAll({
            where: {
              userId: user.id,
            },
          }).then(async (classuser_item) => {

            const deviceToken = req.body.deviceToken;

            const params = {
              PlatformApplicationArn: process.env.AWS_SNS_PLATFORM_APP_ARN,
              Token: deviceToken,
              CustomUserData: 'user_data'
            };
            
            try {
              const data = await req.sns.createPlatformEndpoint(params).promise()
              
              const subscribeParams = {
                Protocol: 'application',
                TopicArn: user.notification_topic_arn,
                Endpoint: data.EndpointArn,
              };

              await req.sns.subscribe(subscribeParams).promise();
              
              console.log("subscribed successfully");
            } catch (err) {
              console.log(err);
            }

            res.status(200).send({
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              instrument: user.instrument,
              class_id: classuser_item[0].ClassId,
              notification_topic_arn: user.notification_topic_arn
            });
          });
        } else {
          res.status(200).send({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            instrument: user.instrument,
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signout = async (req, res) => {
  try {
    User.findByPk(req.userId)
    .then((user) => {
      req.session = null;
      user.getRoles()
      .then(async (roles) => {

        if (roles[0].name === "student") {
          const deviceToken = req.body.deviceToken;

          try {
            // Get EndpointArn
            const listEndpointsParams = {
              PlatformApplicationArn: process.env.AWS_SNS_PLATFORM_APP_ARN,
            };
            let all_endpoints = await req.sns.listEndpointsByPlatformApplication(listEndpointsParams).promise();
            console.log(all_endpoints);
            const endpointArn = all_endpoints.Endpoints.find(e => e.Attributes.Token === deviceToken).EndpointArn;
            if (!endpointArn) {
              console.log('Endpoint not found');
              return;
            }

            // Get subscription
            const subscriptionsParams = {
              TopicArn: user.notification_topic_arn
            };
            let all_subscriptions = await req.sns.listSubscriptionsByTopic(subscriptionsParams).promise();
            const subscriptions = all_subscriptions.Subscriptions.filter(subscription => subscription.Endpoint === endpointArn);
            if (subscriptions.length > 0) {
              const subscriptionArn = subscriptions[0].SubscriptionArn;
              console.log('Subscription ARN:', subscriptionArn);

              // Unsubscribe to topic
              const unsubscribeParams = {
                SubscriptionArn: subscriptionArn
              };
              await req.sns.unsubscribe(unsubscribeParams).promise()

            } else {
              console.log('Endpoint is not subscribed to the topic.');
            }

          } catch (err) {
            console.log('Failed unsubscribe:', err);
          }
          
          return res.status(200).send({
            message: "You've been signed out!",
          });
        } else {
          return res.status(200).send({
            message: "You've been signed out!",
          });
        }

      })
    })
  } catch (err) {
    this.next(err);
  }
};
