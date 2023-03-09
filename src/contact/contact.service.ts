import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactService {
  constructor(@InjectModel(Contact) private contactModel: typeof Contact) {}

  create(createContactDto) {
    return this.contactModel.create(createContactDto);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactModel.findAll();
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
