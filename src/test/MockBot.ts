export class MockBot {
  lastReply: string = ''

  reset() {
    this.lastReply = ''
  }
  // constructor() {
  //   this.reply = this.reply.bind(this);
  // }
  reply(text: string, post?: any) {
    this.lastReply = text;
  }
  follow(text: string, post?: any) {
    this.lastReply = text;
  }
  like(text: string, post?: any) {
    this.lastReply = text;
  }
}

export class MockEvent {
  post: any;
  constructor(post: any) {
    this.post = post;
  }
}
