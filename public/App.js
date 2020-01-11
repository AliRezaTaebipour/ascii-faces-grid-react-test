const Fetch = async ({ page, sort }) =>
  await fetch(
    `/api/products?_page=${page}&_limit=19&_sort=${sort}`
  ).then(response => response.json());
let selectedAds = [];
class App extends React.Component {
  state = {
    products: [],
    nextProducts: [],
    sort: "",
    page: 1,
    endOfProducts: false,
    loading: true
  };
  getProducts = async first => {
    const { sort, page } = this.state;
    try {
      const response = await Fetch({
        page,
        sort
      });
      if (response.length !== 0) {
        if (first) {
          await this.setState({
            products: response,
            loading: false,
            page: 2
          });
        } else {
          await this.setState({ nextProducts: response, page: page + 1 });
        }
      } else {
        this.setState({
          endOfProducts: true
        });
      }
    } catch (err) {
      console.log(err);
    }
    await this.setState({ fetchIsDone: true });
  };
  async componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
    await this.getProducts(true);
    await this.getProducts(false);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
  handleSort = async activeSort => {
    const { sort } = this.state;
    await this.setState({
      page: 1,
      sort: activeSort !== sort ? activeSort : ""
    });
    this.getProducts(true);
    selectedAds = [];
  };
  showProducts = () => {
    const { products } = this.state;
    const productList = [];
    let i = 0;
    let adIndex = 1;
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
              <span className="content-title">ID :</span>
              <span className="content-value">{product.id}</span>
            </p>
            <p>
              <span className="content-title">Price :</span>
              <span className="content-value">{product.price / 100}</span>
            </p>
            <p>
              <span className="content-title">Size :</span>
              <span className="content-value">{product.size}</span>
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
      if (i % 20 === 0 && products.length > 19) {
        let imgSrc;
        if (selectedAds[adIndex]) {
          imgSrc = selectedAds[adIndex];
        } else {
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
    const { nextProducts, products, endOfProducts, loading } = this.state;
    if (
      document.documentElement.scrollTop +
        document.documentElement.clientHeight >=
        document.documentElement.scrollHeight &&
      !endOfProducts &&
      !loading
    ) {
      await this.setState({
        loading: true,
        products: products.concat(nextProducts),
        nextProducts: []
      });
      await this.getProducts(false);
      await this.setState({
        loading: false
      });
    }
  };
  adID = () => {
    let ad = Math.floor(Math.random() * 10);
    while (selectedAds[selectedAds.length - 1] === ad) {
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
