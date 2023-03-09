import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Contact } from 'src/contact/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @Inject('CONTACT_REPOSITORY') private contactRepository: typeof Contact,
    private sequelize: Sequelize,
  ) {}

  create(createContactDto) {
    return this.contactRepository.create(createContactDto);
  }

  async createMany() {
    try {
      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };

        await this.contactRepository.create(
          {
            firstName: 'John',
            lastName: 'Doe',
          },
          transactionHost,
        );

        await this.contactRepository.create(
          {
            firstName: 'John',
            lastName: 'Doe',
          },
          transactionHost,
        );
      });
    } catch (err) {}
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.findAll<Contact>();
  }

  findOne(id: number): Promise<Contact> {
    return this.contactRepository.findOne({ where: { id } });
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return this.contactRepository.update(updateContactDto, { where: { id } });
  }

  async remove(id: number): Promise<void> {
    const contact = await this.findOne(id);
    await contact.destroy();
  }
}
