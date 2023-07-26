import { v4 as uuid } from 'uuid';

export class DestinoViaje {
  private selected:boolean;
  public servicios: string[];
  id = uuid();

  constructor(public nombre:string,public url:string, public votes: number = 0){
    this.selected=false;
    this.servicios = ['pileta','desayuno'];
  }

  isSelected(): boolean {
    return this.selected;
  }

  setSelected(s: boolean){
    this.selected = s;
  }

  voteUp() {
    this.votes++;
  }

  voteDown() {
      this.votes--;
  }
}
