interface EventArgs {
  element: Element;
  type: string;
  listener: (e: UIEvent) => any;
}

export = EventArgs;
