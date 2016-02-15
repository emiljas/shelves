interface EventArgs {
  element: Element | Document;
  type: string;
  listener: (e: UIEvent) => any;
}

export = EventArgs;
