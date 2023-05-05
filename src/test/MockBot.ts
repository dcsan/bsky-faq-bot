export class MockBot {
  lastReply: string = ''

  reset() {
    this.lastReply = ''
  }
  // constructor() {
  //   this.reply = this.reply.bind(this);
  // }
  reply(text: string, post?: any) {
    // ignore post for now
    this.lastReply = text;
    console.log(`mockBot.reply: ${text}`);
  }
}

export class MockEvent {
  post: any;
  constructor(post: any) {
    this.post = post;
  }
}
