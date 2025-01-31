import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  OneToMany,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import {DbNote} from './dbnote.entity';
import {DbFileTreeNode} from './filenode.entity';
import {INote, IFilePathItem, INotebook} from 'shared';
import {dbConf} from '../config/db-conf';

@Entity({name: 'notebooks'})
export class DbNotebook implements INotebook {
  @PrimaryColumn(dbConf.idColumn)
  id!: string;

  @Column(dbConf.shortTextField)
  name!: string;

  @Column(dbConf.shortTextField)
  owner!: string;

  @UpdateDateColumn(dbConf.dateUpdated)
  dateUpdated!: number;

  @CreateDateColumn(dbConf.dateCreated)
  dateCreated!: number;

  @Column({...dbConf.json, name: 'json_content'})
  jsonContent: any = {};

  isLiked!: boolean;

  @OneToMany(type => DbNote, n => n.notebook, {onDelete: 'CASCADE'})
  notes!: INote[];

  @OneToOne(type => DbFileTreeNode, node => node.notebook, {
    onDelete: 'CASCADE',
  })
  fileNode!: DbFileTreeNode;

  path: IFilePathItem[] = [];

  @BeforeUpdate()
  @BeforeInsert()
  updateContentOnSave() {
    this.jsonContent = this.jsonContent || {};
  }

  constructor(base?: INotebook) {
    if (base) {
      const {id, dateCreated, dateUpdated, name, notes, owner, path} = base;
      this.id = id;
      this.dateCreated = dateCreated;
      this.dateUpdated = dateUpdated;
      this.name = name;
      this.notes = notes;
      this.owner = owner;
      this.path = path;
    }
  }
}

// export const covertDbNotebook = (dbNotebook: DbNotebook): INotebook => {
//   const {
//     dateCreated,
//     dateUpdated,
//     id,
//     name,
//     owner,
//     notes,
//     fileNode,
//   } = dbNotebook;

//   return {
//     id,
//     dateCreated: dateCreated.valueOf(),
//     dateUpdated: dateUpdated.valueOf(),
//     name,
//     owner,
//     notes: notes.map(convertDbNote),
//     path: [],
//   };
// };

// export const covertNotebookToDb = (
//   notebook: INotebook,
// ): Partial<DbNotebook> => {
//   const {id, name, owner, notes} = notebook;

//   return {
//     id,
//     dateCreated: dateCreated.valueOf(),
//     dateUpdated: dateUpdated.valueOf(),
//     name,
//     owner,
//     notes,
//   };
// };
