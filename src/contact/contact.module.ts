import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from './entities/contact.entity';
import { ContactProcessor } from './contact.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    SequelizeModule.forFeature([Contact]),
    BullModule.registerQueue({
      name: 'contact',
    }),
  ],
  controllers: [ContactController],
  providers: [ContactService, ContactProcessor],
  exports: [SequelizeModule],
})
export class ContactModule {}
