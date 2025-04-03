module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define("File", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serverKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    text: {
      type: DataTypes.TEXT,
    },
    matchedWords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    locations: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  });

  return File;
};
