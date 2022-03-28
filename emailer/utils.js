const createSubject = (name) => {
  return `${name}, Don't miss this.`;
};

const createMessage = (name) => {
  return `Hi ${name},
    this is a test message.
    regards,
    sal
    `;
};
module.exports = { createMessage, createSubject };
