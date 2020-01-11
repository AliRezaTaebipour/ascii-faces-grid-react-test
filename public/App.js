//Fetch function for fetching data
const Fetch = async ({ page, sort }) =>
  await fetch(
    `/api/products?_page=${page}&_limit=19&_sort=${sort}`
  ).then(response => response.json());
//store ads
let selectedAds = [];
class App extends React.Component {
  state = {
    products: [], //store all products
    nextProducts: [], //store next products
    sort: "", //selected sort option
    page: 1, //page number for fetch function
    endOfProducts: false, //show where products end.
    loading: true //show loading when fetching
  };
  //Get products from server
  getProducts = async first => {
    const { sort, page } = this.state;
    try {
      const response = await Fetch({
        page,
        sort
      });
      if (response.length !== 0) {
        if (first) {
          //first response
          await this.setState({
            products: response,
            page: 2
          });
        } else {
          //other response
          await this.setState({ nextProducts: response, page: page + 1 });
        }
      } else {
        //end of products
        this.setState({
          endOfProducts: true
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  async componentDidMount() {
    //handle scroll feature
    window.addEventListener("scroll", this.handleScroll);
    //first show of products
    await this.getProducts(true);
    //pre-emptively fetch
    await this.getProducts(false);
    this.setState({ loading: false });
  }
  componentWillUnmount() {
    //handle scroll feature
    window.removeEventListener("scroll", this.handleScroll);
  }
  handleSort = async activeSort => {
    //reload all states and get sorted data
    const { sort } = this.state;
    await this.setState({
      page: 1,
      sort: activeSort !== sort ? activeSort : "", //check if its selected or not
      loading: true,
      products: [],
      endOfProducts: false,
      nextProducts: []
    });
    //like the componentDidMount
    await this.getProducts(true);
    await this.getProducts(false);
    this.setState({ loading: false });
    //empty store ads
    selectedAds = [];
  };
  showProducts = () => {
    const { products } = this.state;
    const productList = [];
    let i = 0;
    let adIndex = 1;
    //create products
    for (const product of products) {
      i++;
      productList.push(
        <div className="product-box col" key={product.id}>
          <div className="product-face">
            <span style={{ fontSize: `${product.size}px` }}>
              {product.face}
            </span>
          </div>
          <div className="product-content">
            <p>
              <span className="content-title">Size :</span>
              <span className="content-value">{product.size}</span>
            </p>
            <p>
              <span className="content-title">Price :</span>
              <span className="content-value">{product.price / 100}</span>
            </p>
            <p>
              <span className="content-title">Date :</span>
              <span className="content-value">
                {this.relativeDate(product.date)}
              </span>
            </p>
          </div>
        </div>
      );
      if (i % 20 === 0) {
        //check ads
        let imgSrc;
        if (selectedAds[adIndex]) {
          //if ad is selected before don't get new one
          imgSrc = selectedAds[adIndex];
        } else {
          //get new ad
          imgSrc = this.adID();
          selectedAds[adIndex] = imgSrc;
        }
        productList.push(
          <div className="product-box col ad-img" key={i + "ad"}>
            <img className="ad" src={"/ads/?r=" + imgSrc} alt="ads" />
          </div>
        );
        adIndex++;
      }
    }
    return productList;
  };
  relativeDate = date => {
    //convert date to relative
    const today = new Date();
    const msTomin = 60 * 1000;
    const msToHr = msTomin * 60;
    const msToDay = msToHr * 24;
    const countDate = today - new Date(date);
    switch (true) {
      //check if its second
      case countDate < msTomin:
        return Math.floor(countDate / 1000) + " Seconds ago";
      //check if its minutes
      case countDate < msToHr:
        return Math.floor(countDate / msTomin) + " Minutes ago";
      //check if its hour
      case countDate < msToDay:
        return Math.floor(countDate / msToHr) + " Hours ago";
      //check if its day
      case countDate < msToDay * 8:
        return Math.floor(countDate / msToDay) + " Days ago";
      default:
        //if its not, return full date
        return new Date(date).toDateString();
    }
  };
  handleScroll = async () => {
    //infinity scroll
    const { nextProducts, products, endOfProducts, loading } = this.state;
    if (
      document.documentElement.scrollTop +
        document.documentElement.clientHeight >=
        document.documentElement.scrollHeight &&
      !loading &&
      !endOfProducts
    ) {
      //add new products
      await this.setState({
        products: products.concat(nextProducts),
        // nextProducts: [],
        loading: true
      });
      //get new products
      await this.getProducts(false);
      await this.setState({
        loading: false
      });
    }
  };
  adID = () => {
    //get random add id
    let ad = Math.floor(Math.random() * 10); // ads from 0-9 and 0-99999999 are repeted and have same results
    while (selectedAds[selectedAds.length - 1] === ad) {
      //prevent same ad twice in a row
      ad = Math.floor(Math.random() * 10);
    }
    return ad;
  };
  render() {
    const { sort, endOfProducts, loading } = this.state;
    return (
      <div>
        <div className="container">
          <div className="row sort-div">
            <span className="content-title">Sort By :</span>
            <ul className="sort-group">
              <li
                className={"each-sort" + (sort === "size" ? " activeSort" : "")}
                onClick={() => this.handleSort("size")}
              >
                Size
              </li>
              <li
                className={
                  "each-sort" + (sort === "price" ? " activeSort" : "")
                }
                onClick={() => this.handleSort("price")}
              >
                Price
              </li>
              <li
                className={"each-sort" + (sort === "id" ? " activeSort" : "")}
                onClick={() => this.handleSort("id")}
              >
                Id
              </li>
            </ul>
          </div>
          <div className="row">{this.showProducts()}</div>
          {loading && (
            <div className="loading">
              <img src={"./loading.svg"} alt="loading" />
              <span>loading...</span>
            </div>
          )}
          {endOfProducts && (
            <div className="row">
              <p>~ end of catalogue ~</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
