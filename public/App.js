const Fetch = async ({ limit, page, sort }) =>
  await fetch(
    `/api/products?_page=${page}&_limit=${limit}&_sort=${sort}`
  ).then(response => response.json());

const App = () => {
  const [products, setProducts] = React.useState([]);
  const [nextProducts, setNextProducts] = React.useState([]);
  const [activeSort, setActiveSort] = React.useState("");
  const [limit, setLimit] = React.useState(250);
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState("");
  const [flag, setFlag] = React.useState(true);

  React.useEffect(() => {
    getProducts();
  }, [sort, page]);

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [flag]);

  function handleScroll() {
    if (
      window.innerHeight + window.scrollY >
      document.getElementById("AllProducts").clientHeight +
        document.getElementById("AllProducts").offsetTop
    ) {
      console.log("yyy");
      // setFlag(!flag);
      // setPage(page + 1);
    }
  }

  async function getProducts() {
    try {
      const response = await Fetch({ limit, page, sort });
      setProducts(products.concat(response));
    } catch (err) {
      console.log(err);
    }
  }
  function relativeDate(date) {
    //convert date to relative
    const today = new Date();
    const msTomin = 60 * 1000;
    const msToHr = msTomin * 60;
    const msToDay = msToHr * 24;
    const countDate = today - new Date(date);
    switch (true) {
      case countDate < msTomin:
        return Math.floor(countDate / 1000) + " Seconds ago";
      case countDate < msToHr:
        return Math.floor(countDate / msTomin) + " Minutes ago";
      case countDate < msToDay:
        return Math.floor(countDate / msToHr) + " Hours ago";
      case countDate < msToDay * 8:
        return Math.floor(countDate / msToDay) + " Days ago";
      default:
        return new Date(date).toDateString();
    }
  }
  function handleSort(sort) {
    if (sort !== activeSort) {
      setActiveSort(sort);
      setSort(sort);
    } else {
      setActiveSort("");
      setSort("");
    }
  }

  return (
    <div className="container">
      <div className="row sort-div">
        <span className="content-title">Sort By :</span>
        <ul className="sort-group">
          <li
            className={
              "each-sort" + (activeSort === "size" ? " activeSort" : "")
            }
            onClick={() => handleSort("size")}
          >
            Size
          </li>
          <li
            className={
              "each-sort" + (activeSort === "price" ? " activeSort" : "")
            }
            onClick={() => handleSort("price")}
          >
            Price
          </li>
          <li
            className={"each-sort" + (activeSort === "id" ? " activeSort" : "")}
            onClick={() => handleSort("id")}
          >
            Id
          </li>
        </ul>
      </div>

      <div className="row" id="AllProducts">
        {products.map((product, key) => (
          <div className="grid col" key={key}>
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
                  {relativeDate(product.date)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
