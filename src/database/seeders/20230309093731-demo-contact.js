'use strict';
const { faker } = require('@faker-js/faker/locale/id_ID');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const contacts = [...Array(100)].map((_) => ({
      name: faker.name.fullName(),
      photo: faker.image.avatar(),
      gender: faker.name.sex(),
      pob: faker.address.city(),
      dob: faker.date.past(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      instagram: faker.internet.userName(),
      twitter: faker.internet.userName(),
      address: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip: faker.address.zipCode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('Contacts', contacts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Contacts', null, {});
  },
};
