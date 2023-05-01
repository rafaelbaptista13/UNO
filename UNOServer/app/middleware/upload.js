const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const uploadDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./app/middleware/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});
const upload = multer({ storage });

const processMedia = (req, res, next) => {
  if (!req.file) {
    // If no file skip processing
    return next();
  }

  if (req.file.mimetype.startsWith("video/")) {
    console.log(req.file.originalname);
    // Generate output filename
    const outputFilename = path.join(
      "./app/middleware/uploads/",
      `${Date.now()}.mp4`
    );
    // Create FFmpeg command to downsample video to 720p resolution
    ffmpeg(req.file.path)
      .output(outputFilename)
      .format("mp4")
      .videoFilter(
        "scale=w=720:h=trunc(ow/a/2)*2:force_original_aspect_ratio=decrease"
      )
      .on("error", (err) => {
        console.log(err);
        return next(err);
      })
      .on("end", () => {
        // Replace original file with downsampled file
        fs.unlink(req.file.path, () => {
          fs.rename(outputFilename, req.file.path, () => {
            fs.readFile(req.file.path, (err, data) => {
              if (err) {
                console.error(`Error reading file: ${err}`);
                return next(err);
              }
              req.file.mimetype = "video/mp4"
              req.file.buffer = data;
              next();
            });
          });
        });
      })
      .run();
  }

  else if (req.file.mimetype.startsWith("audio/")) {
    // Generate output filename
    const outputFilename = path.join(
      "./app/middleware/uploads/",
      `${Date.now()}.mp3`
    );
    
    ffmpeg(req.file.path)
      .output(outputFilename)
      .audioCodec("libmp3lame")
      .format("mp3")
      .audioFrequency(44100)
      .on("error", (err) => {
        console.log(err);
        return next(err);
      })
      .on("end", () => {
        // Replace original file with downsampled file
        fs.unlink(req.file.path, () => {
          fs.rename(outputFilename, req.file.path, () => {
            fs.readFile(req.file.path, (err, data) => {
              if (err) {
                console.error(`Error reading file: ${err}`);
                return next(err);
              }
              req.file.mimetype = "audio/mp3"
              req.file.buffer = data;
              next();
            });
          });
        });
      })
      .run();
  }

  else {
    // If file is not a video or audio, skip processing
    console.log(`Not image or video ${req.file.path}`)
    fs.readFile(req.file.path, (err, data) => {
        if (err) {
          console.error(`Error reading file: ${err}`);
          return next(err);
        }
  
        req.file.buffer = data;
        next();
      });
  }
};

const processMediaInQuestionActivity = (req, res, next) => {
  for (let idx in req.files.answers_media) {
    try {
      const data = fs.readFileSync(req.files.answers_media[idx].path);
      req.files.answers_media[idx].buffer = data;
    } catch (err) {
      console.error(`Error reading file: ${err}`);
      return next(err);
    }
  }

  if (!req.files.question_media) {
    // If no file skip processing
    return next();
  }

  if (req.files.question_media[0].mimetype.startsWith("video/")) {
    console.log(req.files.question_media[0].originalname);
    // Generate output filename
    const outputFilename = path.join(
      "./app/middleware/uploads/",
      `${Date.now()}.mp4`
    );
    // Create FFmpeg command to downsample video to 720p resolution
    ffmpeg(req.files.question_media[0].path)
      .output(outputFilename)
      .format("mp4")
      .videoFilter(
        "scale=w=720:h=trunc(ow/a/2)*2:force_original_aspect_ratio=decrease"
      )
      .on("error", (err) => {
        console.log(err);
        return next(err);
      })
      .on("end", () => {
        // Replace original file with downsampled file
        fs.unlink(req.files.question_media[0].path, () => {
          fs.rename(outputFilename, req.files.question_media[0].path, () => {
            fs.readFile(req.files.question_media[0].path, (err, data) => {
              if (err) {
                console.error(`Error reading file: ${err}`);
                return next(err);
              }
              req.files.question_media[0].mimetype = "video/mp4"
              req.files.question_media[0].buffer = data;
              next();
            });
          });
        });
      })
      .run();
  }

  else if (req.files.question_media[0].mimetype.startsWith("audio/")) {
    // Generate output filename
    const outputFilename = path.join(
      "./app/middleware/uploads/",
      `${Date.now()}.mp3`
    );
    
    ffmpeg(req.files.question_media[0].path)
      .output(outputFilename)
      .audioCodec("libmp3lame")
      .format("mp3")
      .audioFrequency(44100)
      .on("error", (err) => {
        console.log(err);
        return next(err);
      })
      .on("end", () => {
        // Replace original file with downsampled file
        fs.unlink(req.files.question_media[0].path, () => {
          fs.rename(outputFilename, req.files.question_media[0].path, () => {
            fs.readFile(req.files.question_media[0].path, (err, data) => {
              if (err) {
                console.error(`Error reading file: ${err}`);
                return next(err);
              }
              req.files.question_media[0].mimetype = "audio/mp3"
              req.files.question_media[0].buffer = data;
              next();
            });
          });
        });
      })
      .run();
  }

  else {
    // If file is not a video or audio, skip processing
    console.log(`Not image or video ${req.files.question_media[0].path}`)
    fs.readFile(req.files.question_media[0].path, (err, data) => {
        if (err) {
          console.error(`Error reading file: ${err}`);
          return next(err);
        }
  
        req.files.question_media[0].buffer = data;
        next();
      });
  }
};

// Middleware function to delete uploaded files after each request
const deleteUploadedFiles = (req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Deleted file ${req.file.path}`);
      }
    });
  }
  next();
};

// Middleware function to delete uploaded files after each request
const deleteUploadedFilesQuestion = (req, res, next) => {
  if (req.files.question_media) {
    fs.unlink(req.files.question_media[0].path, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Deleted file ${req.files.question_media[0].path}`);
      }
    });
  }
  for (let idx in req.files.answers_media) {
    fs.unlink(req.files.answers_media[idx].path, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Deleted file ${req.files.answers_media[idx].path}`);
      }
    });
  }
  next();
};

module.exports = {
  upload,
  processMedia,
  deleteUploadedFiles,
  processMediaInQuestionActivity,
  deleteUploadedFilesQuestion
};
