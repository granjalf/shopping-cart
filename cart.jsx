function Product(props){
    
  return(
      <div className="card mb-3">
          <div className="row g-0">
              <div className="col-md-4">
                  <img src={props.img} className="img-fluid rounded-start" alt={props.imgalt}></img>
              </div>
              <div className="col-md-8">
                  <div className="card-body">
                      <h5 className="card-title">{props.name}</h5>
                      <p className="card-text">{props.description}</p>
                      <div className="row">
                          <div className="col-6">Stock: {props.stock}</div>
                          <div className="col-6">Unit Price: $ {Number.parseFloat(props.price).toFixed(2)}</div>
                      </div>
                      <button className="btn btn-primary" onClick={()=>props.onClick(props.id)}>Add to Cart</button>
                  </div>
              </div>
          </div>
      </div>
  );
}

function CartItem({cart, onClick}){

  return(
      <div className="accordion" id="accordionExample">
          {cart.map((item)=>
              <div key={item.id} className="accordion-item">
              <h2 className="accordion-header">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={"#collapse" + item.id} aria-expanded="false" aria-controls={"collapse" + item.id}>
                  {item.attributes.name}
              </button>
              </h2>
              <div id={"collapse" + item.id} className="accordion-collapse collapse" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                  <div className="row">
                      <div className="col-6">Quantity: {item.attributes.instock}</div>
                      <div className="col-6"><strong>Price: ${Number.parseFloat(item.attributes.cost).toFixed(2)}</strong></div>
                  </div>
                    
                  <div className="row">
                      <div className="col">
                          <button className="btn btn-primary" onClick={()=>onClick(item.id)}>-</button>
                      </div>
                  </div>
              </div>
              </div>
          </div>
          )}
      </div>
  );
}

function App(){

  // Action types
  const FETCH_STARTED = 'FETCH_STARTED';
  const FETCH_SUCCESS = 'FETCH_SUCCESS';
  const MOVE_TO_CART = 'MOVE_TO_CART';
  const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
  const CHECKOUT_CART = 'CHECKOUT_CART';
    
  //We will use the reducer to manage the states. For this we need first to define a initialData
  //for the reducer

  const initialData = {
    isLoading: false,
    isError:false,
    product: [],
    cart: [],
  };

  //Our reducer will need a reduce function where the magic will happen. This function will be used
  //by the useReducer. Receives a states, and action
  const dataReducer = (state, action) =>{
    switch (action.type){
      case FETCH_STARTED:{
        
        return {
          ...state,
          isLoading: true,
          isError: false
        }
      }
      case FETCH_SUCCESS:{
        return {
          ...state,
          products: action.payload,
          isLoading: false,
          isError: false
        }
      }
      case MOVE_TO_CART:{
        const id = action.payload;
        const prod = state.products.find((prod)=>prod.id === id);
        
        if (prod.attributes.instock === 0)
        {
          alert('There is no stock left for ' + prod.attributes.name);

          return{
            ...state,
            cart: [...state.cart],
            products: [...state.products]
          }
        }

        const cartItem = state.cart.find((prod)=>prod.id === id);
        
        if (cartItem){
            cartItem.attributes.instock = cartItem.attributes.instock + 1;
        }
        else{
            state.cart.push({...prod, attributes:{...prod.attributes, instock:1}});
        }
        prod.attributes.instock = prod.attributes.instock -1;

        return{
          ...state,
          cart: [...state.cart],
          products: [...state.products]
        }  
      }
      case REMOVE_FROM_CART:{
        const id = action.payload;
        
        const item = state.cart.find((item)=>item.id === id);
        item.attributes.instock = item.attributes.instock - 1;

        const prod = state.products.find((prod)=>prod.id === id);
        prod.attributes.instock = prod.attributes.instock + 1

        if (item.attributes.instock === 0)
        {
            const index = state.cart.indexOf(item);
            state.cart.splice(index,1);
        }

        return{
          ...state,
          cart: [...state.cart],
          products: [...state.products]
        }
      }
      case CHECKOUT_CART:{

        return{
          ...state,
          cart: [],
        }
      }
      default:
        return state;
    }
  }

  const [state, dispatch] = React.useReducer(dataReducer, initialData);

  const [query, setQuery] = React.useState("http://localhost:1337/api/products");

  const fetchDataFromStrapi = async () =>{
    dispatch({type: FETCH_STARTED});
    try {
        const result = await axios(query);
      
        const products = await Promise.all(
          result.data.data.map(async (product) => {
            // Fetch image from "https://picsum.photos/200"
            const response = await fetch('https://picsum.photos/150');
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
  
            // Update the product with the new image URL
            return { ...product, attributes:{...product.attributes, img: imageUrl} };
          })
        );
        dispatch({type: FETCH_SUCCESS, payload: products});
    } catch (error) {
        console.log(error);
        return {error: {status:1,message:error.message}, products:[]};   
    }
  }

  React.useEffect(() =>{
    fetchDataFromStrapi();
  },[query]);

  const AddToCart = (id)=>{
      dispatch({type:MOVE_TO_CART, payload:id});
  }

  const RemoveFromCart = (id)=>{
    dispatch({type:REMOVE_FROM_CART, payload:id});
  }

  const checkOut=()=>{
    dispatch({type:CHECKOUT_CART});
  }

  const restock= () => {
    fetchDataFromStrapi();
  }



    return(
        <div className="container-fluid">
          {state.isLoading ? 
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          :
          <>
            <h1>Welcome to shopping kart App</h1>
            <div className = "row">
                <div className="col-4">
                    <h3>Product list</h3>
                    <div className="row mb-3">
                        <div className="col-6">
                            <input type="text" className="form-control" value={query} onChange={(e)=>setQuery(e.value)}></input>
                        </div>
                        <div className="col-6">
                            <button className="btn btn-primary" onClick={restock}>Restock</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            { state.products?.length > 0 ? state.products.map((product,i)=>
                                <Product
                                key = {i}
                                id = {product.id}
                                img={product.attributes.img}
                                imgalt={product.attributes.name}
                                name={product.attributes.name}
                                price={product.attributes.cost}
                                stock={product.attributes.instock}
                                onClick={AddToCart}
                            />
                            ) : <p>No products</p>}
                        </div>
                    </div>
                </div>
                <div className="col-4">
                    <h3>My shopping cart</h3>
                    { (state.cart?.length > 0) ? 
                        <CartItem cart={state.cart} onClick={RemoveFromCart}></CartItem> 
                        : <p>Your shopping cart is empty</p>}
                </div>
                <div className="col-4">
                    <h3>Check Out</h3>
                    <div className="row">
                        <div className="col-4">
                            <strong>Product</strong>
                        </div>
                        <div className="col-4">
                            <strong>Quantity</strong>
                        </div>
                        <div className="col-4">
                            <strong>Total Cost</strong>
                        </div>

                    </div>
                    {state.cart.map((item)=>
                      <div className="row" key={item.id}>
                        <div className="col-4">
                          {item.attributes.name}
                        </div>
                        <div className="col-4">
                          {item.attributes.instock}
                        </div>
                        <div className="col-4">
                          $ {Number.parseFloat(item.attributes.instock * item.attributes.cost).toFixed(2)}
                        </div>
                      </div>
                    )}
                    <div className="row">
                      <div className="col-6">
                          <strong>Total Price:</strong>
                      </div>
                      <div className="col-6">
                          <strong>$ {Number.parseFloat(state.cart.reduce((total,item)=>(item.attributes.instock * item.attributes.cost) + total,0)).toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="row mt-3">
                    <div className="col">
                        <button className="btn btn-primary" onClick={checkOut}>Checkout</button>
                    </div>
                    </div>
                </div>
            </div>
          </>
          }
            
        </div>
    );
}

ReactDOM.render(<App/>,document.getElementById('root'));