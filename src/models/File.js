// models/File.js
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define("File", {
    userId: DataTypes.STRING,
    name: DataTypes.STRING,
    fileUrl: DataTypes.STRING,
    text: DataTypes.TEXT,
    tags: DataTypes.JSON,
    matchedWords: DataTypes.JSON,
    locations: DataTypes.JSON,
    date: DataTypes.DATE,
  });

  return File;
};
