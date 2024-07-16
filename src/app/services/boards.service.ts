import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { checkToken } from '@interceptors/token.interceptor';
import { User } from '@models/user.model';
import { Board } from '@models/board.model';
import { Card } from '@models/card.model';
import { Colors } from '@models/colors.model';
import { List } from '@models/list.model';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BoardsService {
  apiUrl = environment.API_URL;
  bufferSpace = 65535; 
  backgroundColor$ = new BehaviorSubject<Colors>('sky');

  constructor(private http: HttpClient) {}

  getBoard(id: Board['id']) {
    return this.http.get<Board>(`${this.apiUrl}/api/v1/boards/${id}`, {
      context: checkToken(),
    })
    .pipe(
      tap(board => this.setBackgroundColor(board.backgroundColor))
    ) ;
  }

  createBoard(title: string, backgroundColor: Colors){
    return this.http.post<Board>(`${this.apiUrl}/api/v1/boards`, {title, backgroundColor},
      {context: checkToken()
      }
    )
  }

  getPosition(cards: Card[], currentIndex: number ){
    if(cards.length === 1){
      return this.bufferSpace
    }
    if(cards.length > 1 && currentIndex === 0){
      const onTopPosition = cards[1].position;
      return onTopPosition/2
    }
    const lastIndex = cards.length-1;
    const prevPosition = cards[currentIndex-1].position;
    const nextPosition = cards[currentIndex+1].position;

    if(cards.length > 2 && currentIndex < lastIndex){
      return (prevPosition+nextPosition)/2
    }
    if(cards.length > 1 && currentIndex === lastIndex){
      const onBottomPosition = cards[lastIndex].position;
      return onBottomPosition + this.bufferSpace
    }
    return 0
  }

  getPositionNewCard(cards: Card[] ){
    if(cards.length === 0){
      return this.bufferSpace
    } 
      const lastIndex = cards.length-1;
      const onBottomPosition = cards[lastIndex].position;
      return onBottomPosition + this.bufferSpace
  }

  getPositionNewList(list: List[]){
    if(list.length === 0){
      return this.bufferSpace
    } 
      const lastIndex = list.length-1;
      const onBottomPosition = list[lastIndex].position;
      return onBottomPosition + this.bufferSpace
  }

  setBackgroundColor(color: Colors){
    this.backgroundColor$.next(color)
  }
}
