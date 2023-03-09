import { Contact } from './contact.entity';

export const contactProviders = [
  {
    provide: 'CONTACT_REPOSITORY',
    useValue: Contact,
  },
];
