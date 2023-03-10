import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'bull';
import puppeteer from 'puppeteer';
import { Contact } from './entities/contact.entity';

@Processor('contact')
export class ContactProcessor {
  constructor(@InjectModel(Contact) private contactModel: typeof Contact) {}

  private readonly logger = new Logger(ContactProcessor.name);

  @Process('submit-all-contact')
  async handleSubmitAll(job: Job<unknown>) {
    //
  }

  @Process('submit-contact')
  async handleSubmit(job: Job<{ user; contactId: number }>) {
    const { contactId } = job.data;
    const { user } = job.data;
    const contact = await this.contactModel.findOne({
      where: { id: contactId },
    });
    if (!contact) {
      return {};
    }

    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto('http://laravel-breeze-react.test/login');
    await page.type('#email', user.email);
    await page.type('#password', user.password);
    await page.click('form button');
    await page.waitForNavigation();
    await page.goto('http://laravel-breeze-react.test/contact/create');
    await page.waitForSelector('input[type=file]');
    const input = await page.$('input[type=file]');
    await input.uploadFile('storage/photos/photo1.jpg');
    await page.waitForNetworkIdle();
    await page.type('#name', contact.name);
    await page.click('#male');
    await page.type('#pob', contact.pob);

    // TODO: fix date format
    await page.type('#dob', '12121992');
    await page.type('#email', contact.email);
    await page.type('#phone', contact.phone);
    await page.type('#instagram', contact.instagram);
    await page.type('#twitter', contact.twitter);
    await page.type('#address', contact.address);
    await page.type('#city', contact.city);
    await page.type('#state', contact.state);
    await page.type('#zip', contact.zip);

    // upload file
    await page.waitForSelector('input[id="file"]');
    const inputPhoto = await page.$('input[id="file"]');
    await inputPhoto.uploadFile('storage/cv/cv1.txt');
    await page.screenshot({ path: `storage/results/${contactId}.png` });
    await page.click('button[type="submit"]');
    await browser.close();
    return {};
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}
