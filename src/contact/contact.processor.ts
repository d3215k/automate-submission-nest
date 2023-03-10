import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import puppeteer from 'puppeteer';

@Processor('contact')
export class ContactProcessor {
  private readonly logger = new Logger(ContactProcessor.name);

  @Process('submit-contact')
  async handleSubmit(job: Job<{ contactId: number }>) {
    const { contactId } = job.data;
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    await page.screenshot({ path: `storage/results/${contactId}.png` });
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
