import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact) private contactModel: typeof Contact,
    @InjectQueue('contact') private submitContactQueue: Queue,
  ) {}

  async submitAllContact(user) {
    const contacts = await this.findAll();
    contacts.forEach(async (contact) => {
      await this.submitContactQueue.add('submit-contact', {
        contactId: contact.id,
        user,
      });
    });
  }

  async submitContact(contactId: number, user) {
    await this.submitContactQueue.add('submit-contact', { contactId, user });
  }

  async create(createContactDto) {
    return this.contactModel.create(createContactDto);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactModel.findAll({ limit: 15 });
  }

  findOne(id: number): Promise<Contact> {
    return this.contactModel.findOne({ where: { id } });
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return this.contactModel.update(updateContactDto, { where: { id } });
  }

  async remove(id: number): Promise<void> {
    const contact = await this.findOne(id);
    await contact.destroy();
  }
}
