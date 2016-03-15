declare var Rossmann: any;
let Cart = Rossmann.Shared.Carts.Cart;
let Et = Rossmann.Shared.Events.Event;

class CartDict {
  private static instance: CartDict;
  public handleProductQuantityChangedCallback: () => void;
  private dict: any = {};

  public static GetInstance(): CartDict {
    if (!CartDict.instance) {
      CartDict.instance = new CartDict();
    }
    return CartDict.instance;
  }

  constructor() {
    Cart.Instance().GettingAllItems().then((items: any) => {
      for (let item of items) {
        this.addToDict(item.ProductId, item.Quantity);
      }
      this.handleProductQuantityChanged();
    });
  }

  public addToDict(productId: number, quantity: number) {
    this.dict[productId] = quantity;
  }

  public handleProductQuantityChanged(): void {
    if (this.handleProductQuantityChangedCallback) {
      this.handleProductQuantityChangedCallback();
    }
  }

  public getDict(): any {
    return this.dict;
  }
}

Et.Listen('AddToCartEvent', (data: any) => {
    handleProductQuantityChanged(data);
});

Et.Listen('RemoveFromCartEvent', (data: any) => {
    handleProductQuantityChanged(data);
});

function handleProductQuantityChanged(data: any) {
    let productId = data.details.id;
    Cart.Instance().GettingQuantity(productId).then((quantity: number) => {
      let cartDict = CartDict.GetInstance();
      cartDict.addToDict(productId, quantity);
      cartDict.handleProductQuantityChanged();
    });
}

export = CartDict;
