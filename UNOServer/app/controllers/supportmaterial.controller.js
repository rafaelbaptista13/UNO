const { sequelize } = require("../models");
const db = require("../models");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const SupportMaterial = db.supportmaterials;
const Op = db.Sequelize.Op;

// Create and Save a new Support Material
exports.create = async (req, res) => {
  const class_id = req.params.class_id;
  const title = req.body.title;
  const description = req.body.description;

  // Validate request
  if (!title) {
    res.status(400).send({
      message: "Content can not be empty! Define a title in form-data.",
    });
    return;
  }

  // Get number of support material
  let materials_data;
  try {
    materials_data = await SupportMaterial.findAll({
      order: [["order", "DESC"]],
      where: {
        class_id: class_id
      }
    });
  } catch (e) {
    console.log(e);
  }
  let material_number = 1;
  if (materials_data.length !== 0)
    material_number = materials_data[0].dataValues.order + 1;

  let media_type;
  let secret_key;
  let file_name;
  if (req.file) {
    // Save media type
    media_type = req.file.mimetype;
    secret_key = crypto.randomBytes(16).toString("hex");
    // Encrypt file
    const encryptedFile = CryptoJS.AES.encrypt(
      req.file.buffer.toString("base64"),
      secret_key
    );

    // Generate file name
    file_name = uuidv4();
    try {
      // Upload file in AWS S3 bucket
      const params = {
        Bucket: "violuno",
        Key: file_name,
        Body: encryptedFile.toString(),
      };

      await req.s3.upload(params).promise();
    } catch (err) {
      console.error(err);
      res.status(500).send("Error uploading file");
      return;
    }
  } else {
    media_type = null;
    secret_key = null;
    file_name = null;
  }

  // Create a Support Material
  const support_material = {
    order: material_number,
    title: title,
    description: description,
    media_id: file_name,
    media_type: media_type,
    media_secret: secret_key,
    class_id: class_id,
  };

  // Save SupportMaterial in the database
  SupportMaterial.create(support_material)
    .then((data) => {
      const filtered_data = {
        id: data.id,
        order: data.order,
        title: data.title,
        description: data.description,
        class_id: data.class_id,
      };
      res.send(filtered_data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the SupportMaterial.",
      });
    });
};

// Update a Support Material by the id in the request
exports.update = (req, res) => {
  const id = req.params.supportmaterial_id;

  // Find Material
  SupportMaterial.findByPk(id)
    .then( async (material) => {
      if (material === null) throw new Error();

      let updated_material = {
        title: req.body.title,
        description: req.body.description
      }

      if (req.file) {
        // Save media type
        let media_type = req.file.mimetype;
        let secret_key = crypto.randomBytes(16).toString("hex");
        // Encrypt file
        const encryptedFile = CryptoJS.AES.encrypt(
          req.file.buffer.toString("base64"),
          secret_key
        );

        // Generate file name
        let file_name = uuidv4();
        try {
          // Upload file in AWS S3 bucket
          const params = {
            Bucket: "violuno",
            Key: file_name,
            Body: encryptedFile.toString(),
          };

          await req.s3.upload(params).promise();
        } catch (err) {
          console.error(err);
          res.status(500).send("Error uploading file");
          return;
        }
        updated_material.media_id = file_name;
        updated_material.media_type = media_type;
        updated_material.media_secret = secret_key;
      }

      if (req.body.empty_media === "true") {
        updated_material.media_id = null;
        updated_material.media_type = null;
        updated_material.media_secret = null;
      }

      material.update(updated_material).then((num) => {
        res.send({
          message: "SupportMaterial was updated successfully.",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating SupportMaterial with id=" + id,
      });
    });
};

// Get Media from Support Material
exports.getMedia = async (req, res) => {
  const class_id = req.params.class_id;
  const supportmaterial_id = req.params.supportmaterial_id;

  // Get SupportMaterial
  let supportmaterial = await SupportMaterial.findOne({
    where: {
      id: supportmaterial_id,
      class_id: class_id,
    },
  });
  if (supportmaterial === null) {
    res.status(400).send({
      message: "Support Material not found!",
    });
    return;
  }

  if (supportmaterial.media_type === null) {
    res.status(400).send({
      message: "This Support Material does not contain any media associated!",
    });
    return;
  }

  // Save media type
  const media_type = supportmaterial.media_type;

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({ Bucket: "violuno", Key: supportmaterial.media_id })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    supportmaterial.media_secret
  );

  res.set("Content-Type", media_type);
  res
    .status(200)
    .send(Buffer.from(decryptedFile.toString(CryptoJS.enc.Utf8), "base64"));
};

// Retrieve a Support Material by the id in the request
exports.findOne = (req, res) => {
  const class_id = req.params.class_id;
  const supportmaterial_id = req.params.supportmaterial_id;

  // Get SupportMaterial
  SupportMaterial.findOne({
    where: {
      id: supportmaterial_id,
      class_id: class_id,
    },
  })
    .then(async (material) => {
      if (material === null) {
        res.status(400).send({
          message: "Material not found.",
        });
        return;
      }

      material = material.toJSON();

      delete material.media_secret;
      delete material.media_id;

      res.send(material);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the Material.",
      });
    });
};

// Retrieve all Support Materials of a Class
exports.findAll = (req, res) => {
  const class_id = req.params.class_id;

  SupportMaterial.findAll({
    where: {
      class_id: class_id,
    },
    order: [["order", "ASC"]],
    attributes: ["id", "order", "title", "description", "media_type"],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving SupportMaterials.",
      });
    });
};

// Update the order of all activities of a activitygroup
exports.change_order = async (req, res) => {
  const class_id = req.params.class_id;
  const new_order = req.body.new_order;

  if (!new_order) {
    res.status(400).send({
      message: "new_order can not be empty!",
    });
    return;
  }

  // Check new order
  const _old_order = await SupportMaterial.findAll({
    where: {
      class_id: class_id,
    },
    order: [["order", "ASC"]],
    attributes: ["id"],
    raw: true,
  });
  if (_old_order.length < 2) {
    res.status(400).send({
      message:
        "Impossible to reorder, there are only zero or one SupportMaterials!",
    });
    return;
  }
  const old_order = _old_order.map((item) => item.id);
  let sorted_new_order = [...new_order].sort();
  if (old_order.sort().join(",") !== sorted_new_order.join(",")) {
    res.status(400).send({
      message: "Wrong SupportMaterials ids.",
    });
    return;
  }

  try {
    await sequelize.transaction(async (t) => {
      let order = 1;
      for (let supportmaterial_id of new_order) {
        await SupportMaterial.update(
          { order: order },
          { where: { id: supportmaterial_id }, transaction: t }
        );
        order++;
      }
    });

    res.send({
      message: `Order was changed successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not change order of SupportMaterials.",
    });
  }
};

// Delete a activity from the database.
exports.delete = async (req, res) => {
  const class_id = req.params.class_id;
  const id = req.params.supportmaterial_id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Get the material number of the material to be deleted
      const material_to_delete = await SupportMaterial.findOne(
        {
          where: {
            id: id,
            class_id: class_id,
          },
        },
        { transaction: t }
      );
      if (material_to_delete === null)
        throw new Error(
          `Cannot delete SupportMaterial with id=${id}. Maybe SupportMaterial was not found!`
        );
      const material_number_to_delete = material_to_delete.order;

      // Delete the material
      await material_to_delete.destroy({
        transaction: t,
      });

      // Get the materials that had a higher order to update them
      const remaining_materials = await SupportMaterial.findAll({
        where: {
          order: { [Op.gt]: `${material_number_to_delete}` },
          class_id: class_id,
        },
        transaction: t,
      });

      // Update each order by decreasing one
      for (let idx in remaining_materials) {
        let material = remaining_materials[idx];
        await SupportMaterial.update(
          { order: material.order - 1 },
          { where: { id: material.id }, transaction: t }
        );
      }

      return material_to_delete;
    });

    res.send({
      message: `SupportMaterial with id=${result.id} was deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete SupportMaterial with id=" + id,
    });
  }
};
