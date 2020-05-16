import { FunctionalComponent, h, RenderableProps } from "preact";
import { Route, Router } from "preact-router";
import { Provider } from "@preact/prerender-data-provider";

// Code-splitting is automated for routes
import BlogsRoute from "../routes/blogs";
import BlogRoute from "../routes/blog";
import HomeRoute from "../routes/home";
import NotFoundPage from "../routes/notfound";

const App: FunctionalComponent = props => {
  return (
    <Provider value={props}>
      <div id="app">
        <Router>
          <Route path="/" component={HomeRoute}/>
          <Route path="/blogs" component={BlogsRoute}/>
          <Route path="/blogs/:blog" component={BlogRoute}/>
          <Route default component={NotFoundPage} type="404"/>
        </Router>
      </div>
    </Provider>
  );
};
export default App;

/*export default class App extends Component {

	/!** Gets fired when the route changes.
	 *  @param {Object} e    "change" event from [preact-router](http://git.io/preact-router)
	 *  @param {string} e.url  The newly routed URL
	 *!/
	handleRoute: (e: RouterOnChangeArgs) => void = e => {
		this.currentUrl = e.url;
	};
	private currentUrl: string;

	render(props) {
		return (
			<Provider value={props}>
				<div id="app">
					<Header />
					<Router onChange={this.handleRoute}>
						<Home path="/" />
						<Blog path="/blog/:name" />
						<Blogs path="/blog/" />
						<ContactSuccess path="/contact/success" />
						<Contact path="/contact/" />
						<NotFoundPage type="404" default />
					</Router>
				</div>
			</Provider>
		);
	}
}*/
