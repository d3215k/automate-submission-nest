import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Post('submit-all')
  async submitAllContact(@Body() user: any) {
    this.contactService.submitAllContact(user);
    return { message: 'Submitted all contact to process' };
  }

  @Post('submit-ten')
  async submitTenContact(@Body() user: any) {
    this.contactService.submitTenContact(user);
    return { message: 'Submitted ten contact to process' };
  }

  @Post('submit/:id')
  async submitContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.contactService.submitContact(id, body);
    return { message: 'Submitted contact to process queue' };
  }

  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(+id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.remove(+id);
  }
}
