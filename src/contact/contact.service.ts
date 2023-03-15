import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact) private contactModel: typeof Contact,
    @InjectQueue('contact') private submitContactQueue: Queue,
  ) {}

  private readonly logger = new Logger(ContactService.name);

  async submitAllContact(user) {
    await this.saveCookies(user);
    const contacts = await this.findAll();
    await this.submitToQueue(contacts);
  }

  async submitTenContact(user) {
    await this.saveCookies(user);
    const contacts = await this.findTen();
    await this.submitToQueue(contacts);
  }

  async submitOneContact(contactId: number, user) {
    await this.saveCookies(user);
    await this.submitContact(contactId);
  }

  async saveCookies(user) {
    const browser = await puppeteer.launch({
      // headless: false,
    });
    const page = await browser.newPage();
    await page.goto('http://laravel-breeze-react.test/login');
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
    await page.type('#email', user.email);
    await page.type('#password', user.password);
    await page.click('form button');
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });

    const cookies = await page.cookies();

    await fs.writeFile(
      './storage/cookies.json',
      JSON.stringify(cookies, null, 2),
    );
  }

  async submitContact(contactId: number) {
    await this.submitContactQueue.add(
      'submit-contact',
      { contactId },
      { attempts: 3, backoff: { type: 'fixed', delay: 1000 } },
    );
    this.logger.log(`Submitted contact ${contactId} to process queue`);
  }

  async submitToQueue(contacts) {
    contacts.forEach(async (contact) => {
      await this.submitContact(contact.id);
    });
  }

  async create(createContactDto) {
    return this.contactModel.create(createContactDto);
  }

  async findTen(): Promise<Contact[]> {
    return this.contactModel.findAll({ limit: 10 });
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
