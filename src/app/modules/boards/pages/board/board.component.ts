import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { TodoDialogComponent } from '@boards/components/todo-dialog/todo-dialog.component';
import { ToDo, Column } from '@models/todo.model';
import { BoardsService } from '@services/boards.service';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';
import { CardsService } from '@services/cards.service';
import { List } from '@models/list.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ListsService } from '@services/lists.service';
import { BACKGROUNDS } from '@models/colors.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styles: [
    `
      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drag-animating {
        transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class BoardComponent implements OnInit, OnDestroy {

  board: Board | null = null;
  inputCard= new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required]
  });
  showListForm= false;
  inputList= new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required]
  });
  colorBackgrounds = BACKGROUNDS;

/* Se pone dinámico luego de los modelos de cards y lists.
  columns: Column[] = [
    {
      title: 'ToDo',
      todos: [
        {
          id: '1',
          title: 'Make dishes',
        },
        {
          id: '2',
          title: 'Buy a unicorn',
        },
      ],
    },
    {
      title: 'Doing',
      todos: [
        {
          id: '3',
          title: 'Watch Angular Path in Platzi',
        },
      ],
    },
    {
      title: 'Done',
      todos: [
        {
          id: '4',
          title: 'Play video games',
        },
      ],
    },
  ];
*/
  constructor(
    private dialog: Dialog,
    private route: ActivatedRoute,
    private boardService: BoardsService,
    private cardService: CardsService,
    private listService: ListsService
    ) {}

  ngOnInit(){
    this.route.paramMap.subscribe(params => {
        const id = params.get('boardId');
        if(id){
          this.getBoard(id);
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.boardService.setBackgroundColor('sky')
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    };
    //after movement
    const position = this.boardService.getPosition(event.container.data, event.currentIndex);
    const card =  event.container.data[event.currentIndex];
    const listId = event.container.id;
    this.updateCard(card, position, listId);

  }

  addList() {
    const title = this.inputList.value;
    if(this.board){
      this.listService.create({
        title, 
        boardId: this.board.id,
        position: this.boardService.getPositionNewList(this.board.lists)
      }).subscribe(list => {
        this.board?.lists.push({
          ...list,
          cards: [] 
        }
        );
        this.showListForm = true;
        this.inputList.setValue('')
      })
    }
  }

  openDialog(card: Card) {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      minWidth: '300px',
      maxWidth: '50%',
      data: {
        card: card,
      },
    });
    dialogRef.closed.subscribe((output) => {
      if (output) {
        console.log(output);
      }
    });
  }
  
  private getBoard(id: string){
    this.boardService.getBoard(id)
    .subscribe(board => {
      this.board = board
    })
  }

  private updateCard(card: Card, position: number, listId: string | number) {
    this.cardService.update(card.id, {
      position, listId,
      title: '',
      description: ''
    })
    .subscribe((cardUpdated) => {
      console.log(cardUpdated);
    })
  }

  openCardForm(list: List){
    if(this.board?.lists) {
      this.board.lists = this.board.lists.map(iteratorList => {
        if(iteratorList.id === list.id){
          return {
            ...iteratorList, 
            showCardForm: true
          }
        } return {
          ...iteratorList, 
            showCardForm: false
        }
      })
    }
  }

  createCard(list: List){
    const title = this.inputCard.value;
    if(this.board){
      this.cardService.create({
        title, 
        listId: list.id,
        boardId: this.board.id,
        position: this.boardService.getPositionNewCard(list.cards)
      }).subscribe(card => {
        list.cards.push(card);
        this.inputCard.setValue('');
        list.showCardForm = false;
      })
    }
  }

  closeCardForm(list: List){
    list.showCardForm = false
  }

  get colors(){
    if (this.board){
      const classes = this.colorBackgrounds[this.board.backgroundColor]
      return classes ? classes: {}
    }
    return {}
  }


}
