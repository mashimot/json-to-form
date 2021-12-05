import { of, BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';


export class FileNode {
  children?: FileNode[] = [];
  name: string = '';
  options?: string = '';
  type: string = '';
}

/** Flat to-do item node with expandable and level information */
export class FileFlatNode {
  name: string = '';
  type: string = '';
  options?: string = ''
  level: number = 0;
  expandable: boolean = false;
}

const FILES = [
  {
    //id: 1,
    name: "app",
    type: 'folder',
    children: [
      {
        name: "public",
        type: 'folder',
        children: [
          {
            name: 'shared',
            type: 'folder',
            children: []
          },
          {
            name: 'components',
            type: 'folder',
            children: []
          },
          {
            name: 'models',
            type: 'folder',
            children: []
          },
          {
            name: 'services',
            type: 'folder',
            children: []
          },
          {
            name: 'pipes',
            type: 'folder',
            children: []
          }]
      },
      {
        //id: 2,
        name: "private",
        type: 'folder',
        children: []
      },
      {
        name: 'core',
        type: 'folder',
        children: [{
            name: 'auth',
            type: 'folder',
            children: []
        },{
          name: 'guards',
          type: 'folder',
          children: []
        },{
          name: 'interceptors',
          type: 'folder',
          children: []
        },{
          name: 'services',
          type: 'folder',
          children: []
        }]
      }
    ]
  }
];

@Component({
  selector: 'app-folder-structure',
  templateUrl: './folder-structure.component.html',
  styleUrls: ['./folder-structure.component.css']
})
export class FolderStructureComponent implements OnInit {
  @Input() files: any;

  dataChange: BehaviorSubject<any> = new BehaviorSubject<any[]>([]);
  dataChange$ = this.dataChange.asObservable();

  flatNodeMap: Map<FileFlatNode, FileNode>  = new Map<FileFlatNode, FileNode>();
  nestedNodeMap: Map<FileNode, FileFlatNode> = new Map<FileNode, FileFlatNode>();

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl!: FlatTreeControl<FileFlatNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener!: MatTreeFlattener<FileNode, FileFlatNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource!: MatTreeFlatDataSource<FileNode, FileFlatNode>;

  hasNoContent = (index: number, node: FileFlatNode) => {
    console.log('node', node.name);
    return node.name === ''
  }


  constructor() {
    this.dataChange.next(FILES);

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<FileFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataChange$.subscribe(data =>{
      this.dataSource.data = data;
    })
  }

  ngOnInit(): void {
    this.treeControl.expandAll();
  }

  ngAfterViewInit(){
    
  }

  /**
 * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
 */
  transformer = (node: FileNode, level: number) => {
    let flatNode = (
      this.nestedNodeMap.has(node) &&
      this.nestedNodeMap.get(node)!.name === node.name
    )
      ? this.nestedNodeMap.get(node)!
      : new FileFlatNode();

    flatNode.name = node.name;
    flatNode.type = node.type;
    flatNode.level = level;
    flatNode.options = node.options;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Get the level of the node */
  getLevel(node: FileFlatNode) {
    return node.level;
  }

  /** Return whether the node is expanded or not. */
  isExpandable(node: FileFlatNode) {
    return node.expandable;
  };

  /** Get the children for the node. */
  getChildren(node: FileNode) {
    return of(
      node.children
        ? node.children
        : []
    );
  }

  /** Get whether the node has children or not. */
  hasChild(index: number, node: FileFlatNode){
    return node.expandable;
  }

  createCrud(node: FileFlatNode, name: string){
    const nestedNode = this.flatNodeMap.get(node) as FileNode;
    nestedNode.name = name;

    if(nestedNode.type == 'file'){
      nestedNode.type = 'file';
      this.dataChange?.next(
        this.dataSource.data
      );
      return;
    }

    const crud = [
      'list',
      'show',
      'form',
    ]
    nestedNode.type = 'folder';
    nestedNode.children = [];
    if(nestedNode.options == 'crud'){
      nestedNode.children = crud.map(c => {
        return {
          name: `${name}-${c}`,
          type: 'folder',
          children: [{
            name: `${name}-${c}.component.ts`,
            type: 'file'
          }]
        }
      });
    }

    this.dataChange?.next(
      this.dataSource.data
    );
  }

  addNew(file: FileFlatNode, type: string, name: string = ''){
    const parentNode = this.flatNodeMap.get(file) as FileNode;
    let options = '';
    let auxName = name;
    if(type == 'crud'){
      type = 'folder';
      options = 'crud';
    }

    if (parentNode.children) {
      let data: any = {
        name: '',
        type: type,
      };
   
      if(options == 'crud'){
        const crud = [
          'list',
          'show',
          'form',
        ]
        data.name = auxName;
        data.type = 'folder';
        data.options = 'crud';
        data.children = [];
        data.children = crud.map(c => {
            return {
              name: `${auxName}-${c}`,
              type: 'folder',
              children: [{
                name: `${auxName}-${c}.component.ts`,
                type: 'file'
              }]
            }
          });
      }

      parentNode.children.push(data);

      this.dataChange?.next(
        this.dataSource.data
      );
      this.treeControl.expand(file);
    }
  }

  deleteNode(node: FileFlatNode){
 
  }

  addNewFolder(file: FileFlatNode, name: string = ''){
    const parentNode = this.flatNodeMap.get(file) as FileNode;

    if (parentNode.children) {
      let data = {
        name: name,
        type: 'folder',
        children: []
      };

      parentNode.children.push(data);
      this.dataChange?.next(
        this.dataSource.data
      );
      this.treeControl.expand(file);
    }
  }

  addFolder(folder: any){

  }

  addFile(){

  }
}
