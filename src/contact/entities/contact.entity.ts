import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Contact extends Model {
  @Column
  name: string;

  @Column
  photo: string;

  @Column
  gender: string;

  @Column
  pob: string;

  @Column
  dob: Date;

  @Column
  email: string;

  @Column
  phone: string;

  @Column
  instagram: string;

  @Column
  twitter: string;

  @Column
  address: string;

  @Column
  city: string;

  @Column
  state: string;

  @Column
  zip: string;

  @Column
  cv: string;

  @Column
  createdAt: Date;

  @Column
  updatedAt: Date;
}
