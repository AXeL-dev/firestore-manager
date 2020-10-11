import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd/core';
import { DiffStyle, DiffFormat } from 'ngx-diff2html';
import { sortObject } from 'src/app/helpers/sort.helper';

@Component({
  selector: 'fm-cache-diff',
  templateUrl: './cache-diff.component.html',
  styleUrls: ['./cache-diff.component.css']
})
export class CacheDiffComponent implements AfterViewInit {

  @Input() diffStyle: DiffStyle = 'word';
  @Input() outputFormat: DiffFormat = 'line-by-line';
  @Input() reverseContent: boolean = false;
  @Output() diffInit: EventEmitter<boolean> = new EventEmitter<boolean>();
  collectionNodes: any[] = [];
  newNodes: string[] = [];
  removedNodes: string[] = []; // Not used
  isLoading: boolean = true;
  diff: string = null;
  diffContent: any = null;

  constructor(private firestore: FirestoreService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.getCacheDiff().then(() => {
      let isEmpty = false;
      // Select first node
      if (this.collectionNodes.length) {
        const node = this.collectionNodes[0];
        node.selected = true;
        this.diffContent = {
          left: node.oldContent,
          right: node.newContent,
          filename: node.title
        };
        this.collectionNodes = [...this.collectionNodes]; // refresh
      } else {
        isEmpty = true;
      }
      this.diffInit.emit(isEmpty);
      this.isLoading = false;
      this.cdr.detectChanges(); // used to fix "Expression has changed after it was checked" error
    });
  }

  private getCacheDiff(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // used to allow showing the modal without freezes
        const cache = this.firestore.cache;
        const syncedCache = this.convertDates(this.firestore.getSyncedCache());
        // Check collections diff
        Object.keys(cache).forEach((collectionName: string) => {
          const newCache = JSON.stringify(sortObject(cache[collectionName]), null, 4);
          const oldCache = JSON.stringify(sortObject(syncedCache[collectionName] || {}), null, 4);
          if (newCache !== oldCache) {
            const node: NzTreeNode|any = { title: collectionName, key: collectionName, expanded: true, children: [], oldContent: oldCache, newContent: newCache };
            // Check documents diff
            Object.keys(cache[collectionName]).forEach((documentName: string) => {
              const newCache = JSON.stringify(sortObject(cache[collectionName][documentName]), null, 4);
              const oldCache = JSON.stringify(sortObject(syncedCache[collectionName] ? syncedCache[collectionName][documentName] || {} : {}), null, 4);
              if (newCache !== oldCache) {
                let oldContent = oldCache;
                let newContent = newCache;
                if (!oldCache) {
                  this.newNodes.push(collectionName + '.' + documentName); // add collection name to avoid conflict with documents from other collections
                  oldContent = '';//newContent;
                }
                node.children.push({ title: documentName, key: collectionName + '.' + documentName, oldContent: oldContent, newContent: newContent, isLeaf: true });
              }
            });
            // Add node
            this.collectionNodes.push(node);
          }
        });
        resolve();
      }, 1000);
    });
  }

  private convertDates(data: any) {
    if (!data) {
      return data;
    }
    if (data instanceof Date) {
      data = data.toISOString();
    } else if (typeof data === 'object') {
      Object.keys(data).forEach((key: string) => {
        data[key] = this.convertDates(data[key]);
      });
    }
    return data;
  }

  onCollectionNodeClick(event: Required<NzFormatEmitEvent>) {
    // console.log(event);
    const node: NzTreeNode|any = event.node;
    node.isSelected = true;
    node.isExpanded = true; //!node.isExpanded;
    this.diffContent = {
      left: node.origin.oldContent,
      right: node.origin.newContent,
      filename: node.title
    };
  }

  isNewNode(node: NzTreeNode): boolean {
    return this.newNodes.includes(node.key);
  }

  isRemovedNode(node: NzTreeNode): boolean {
    return this.removedNodes.includes(node.key);
  }

}
