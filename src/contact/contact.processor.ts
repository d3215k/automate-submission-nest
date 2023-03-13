import {
  OnQueueActive,
  OnQueueCleaned,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueueProgress,
  OnQueueWaiting,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'bull';
import puppeteer from 'puppeteer';
import { Contact } from './entities/contact.entity';

@Processor('contact')
export class ContactProcessor {
  constructor(@InjectModel(Contact) private contactModel: typeof Contact) {}

  private readonly logger = new Logger(ContactProcessor.name);

  @Process({ name: 'submit-contact', concurrency: 2 })
  async handleSubmit(job: Job<{ user; contactId: number }>) {
    try {
      const { contactId } = job.data;
      const { user } = job.data;
      const contact = await this.contactModel.findOne({
        where: { id: contactId },
      });
      if (!contact) {
        return {};
      }

      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto('http://laravel-breeze-react.test/login');
      await page.waitForSelector('#email');
      await page.type('#email', user.email);
      await page.type('#password', user.password);
      await page.click('form button');
      await page.waitForNavigation();
      await page.goto('http://laravel-breeze-react.test/contact/create');

      await page.waitForSelector('#male');
      let photoName = `photo1.jpg`;
      await page.click('#male');
      if (contact.gender === 'female') {
        await page.click('#female');
        photoName = `photo2.jpg`;
      }
      await page.waitForSelector('input[id="photo"]');
      const input = await page.$('input[id="photo"]');
      await input.uploadFile(`storage/photos/${photoName}`);
      await page.waitForNetworkIdle();
      await page.type('#name', contact.name);
      await page.type('#pob', contact.pob);

      const dobString = await page.evaluate(
        (d) =>
          new Date(d).toLocaleDateString(navigator.language, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
        contact.dob.toISOString(),
      );

      await page.type('#dob', dobString);
      await page.type('#email', contact.email);
      await page.type('#phone', contact.phone);
      await page.type('#instagram', contact.instagram);
      await page.type('#twitter', contact.twitter);
      await page.type('#address', contact.address);
      await page.type('#city', contact.city);
      await page.type('#state', contact.state);
      await page.type('#zip', contact.zip);

      await page.waitForSelector('input[id="cv"]');
      const inputPhoto = await page.$('input[id="cv"]');
      await inputPhoto.uploadFile('storage/cv/cv1.txt');
      await page.waitForNetworkIdle();
      // await page.screenshot({ path: `storage/results/${contactId}.png` });
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
      await browser.close();
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  @OnQueueWaiting()
  onWaiting(jobId: number) {
    this.logger.log(`Job ${jobId} waiting`);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    this.logger.log(`Job ${job.id} progress: ${progress}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name} with error ${error.message}`,
    );
  }

  @OnQueueCleaned()
  onCleaned(job: Job, result: unknown) {
    this.logger.log(
      `Cleaned job ${job.id} of type ${job.name} with result ${result}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: unknown) {
    this.logger.log(
      `Completed job ${job.id} of type ${job.name} with result ${result}`,
    );
  }
}
