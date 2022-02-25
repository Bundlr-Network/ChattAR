import React from 'react';
import { Routes, Route, Outlet, useParams, useNavigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { WalletSelectButton } from './components/WalletSelectButton';
import { NewPost } from './components/NewPost';
import { Posts } from './components/Posts';
import { ProgressSpinner } from './components/ProgressSpinner';
import { TopicSearch } from './components/TopicSearch';
import { UserSearch } from './components/UserSearch';
import { arweave, buildQuery, createPostData, delay, delayResults } from './lib/api';
import './App.css';
import { WebBundlr } from '@bundlr-network/client/build/web/';
// import { useToast } from '@chakra-ui/react';

// // suboptimal global state handler - if you have a better way of doing this do PR.
// const globalState ={
//   wallet: {},
//   currency: ""
// }
// export const globalStateContext = React.createContext(globalState as any);
// const dispatchStateContext = React.createContext({} as any);

// const GlobalStateProvider = ({ children }) => {
//   const [state, dispatch] = React.useReducer(
//     (state, newValue) => ({ ...state, ...newValue }),
//     globalState
//   );
//   return (
//     <globalStateContext.Provider value={state}>
//       <dispatchStateContext.Provider value={dispatch}>
//         {children}
//       </dispatchStateContext.Provider>
//     </globalStateContext.Provider>
//   );
// };

// export const useGlobalState = () => [
//   React.useContext(globalStateContext),
//   React.useContext(dispatchStateContext)
// ];


async function waitForNewPosts(txid) {
  let count = 0;
  let foundPost;
  let posts;

  while (!foundPost) {
    count += 1;
    console.log(`attempt ${count}`);
    await delay(2000 * count);
    posts = await getPosts();
    foundPost = posts.find(p => p.txid === txid);
  }

  let i = posts.indexOf(foundPost);
  posts.unshift(posts.splice(i, 1)[0]);
  return posts;
}

async function getPosts(ownerAddress?, topic?): Promise<{
  txid: any;
  owner: any;
  topic: any;
  height: any;
  length: any;
  timestamp: number;
  request: any;
  error: string;
}[]> {
  const query = buildQuery({ count: 0, address: ownerAddress, topic });
  const results = await arweave.api.post('/graphql', query)
    .catch(err => {
      console.error('GraphQL query failed', err);
      throw new Error(err);
    });
  const edges = results.data.data.transactions.edges;
  const res = await delayResults(100, edges.map(edge => createPostData(edge.node)));
  console.log("res")
  console.log(res)
  return res
}

const App = () => {
  const [bundlr, setBundlr] = React.useState<WebBundlr>();
  const [postItems, setPostItems] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);


  
  // const toast = useToast()

  async function waitForPost(txid) {
    setIsSearching(true)
    console.log("txid")
    console.log(txid)
    let items = await waitForNewPosts(txid);
    setPostItems(items)
    setIsSearching(false);
  }

  React.useEffect(() => {
    setIsSearching(true)
    getPosts().then(items => {
      setPostItems(items);
      setIsSearching(false);
    });
  }, [])

  return (
    <div id="app">
      <div id="content">
        <aside>
          <Navigation />
          <WalletSelectButton onBundlrInit={setBundlr} onDisconnect={(_) =>{console.log("disconnecting!"); setBundlr(undefined)}} />
        </aside>
        <main>
          <Routes>
            <Route path="/" element={
              <Home
                bundlr={bundlr}
                isSearching={isSearching}
                postItems={postItems}
                onPostMessage={waitForPost}
              />}
            />
            <Route path="/topics" element={<Topics />}>
              <Route path="/topics/" element={<TopicSearch />} />
              <Route path=":topic" element={<TopicResults />} />
            </Route>
            <Route path="/users" element={<Users />}>
              <Route path="/users/" element={<UserSearch />} />
              <Route path=":addr" element={<UserResults />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

const Home = (props) => {
  return (
    <>
      <header>Home</header>
      <NewPost bundlr={props.bundlr} onPostMessage={props.onPostMessage} />
      {props.isSearching && <ProgressSpinner />}
      <Posts postItems={props.postItems} />
    </>
  );
};

const Topics = (props) => {
  return (
    <>
      <header>Topics</header>
      <Outlet />
    </>
  );
};

const Users = () => {
  return (
    <>
      <header>Users</header>
      <Outlet />
    </>
  );
};

const TopicResults = () => {
  const [topicPostItems, setTopicPostitems] = React.useState([] as any[]);
  const [isSearching, setIsSearching] = React.useState(false);
  const { topic } = useParams();
  const navigate = useNavigate();

  const onTopicSearch = (topic) => {
    navigate(`/topics/${topic}`);
  }

  React.useEffect(() => {
    setIsSearching(true);
    setTopicPostitems([]);
    try {
      getPosts(null, topic).then(items => {
        setTopicPostitems(items);
        setIsSearching(false);
      });
    } catch (error) {
      console.error(error);
      setIsSearching(false);
    }
  }, [topic])
  return (
    <>
      <TopicSearch searchInput={topic} onSearch={onTopicSearch} />
      {isSearching && <ProgressSpinner />}
      <Posts postItems={topicPostItems} />
    </>
  )
}

function UserResults() {
  const [userPostItems, setUserPostItems] = React.useState([] as any[]);
  const [isSearching, setIsSearching] = React.useState(false);
  const { addr } = useParams();
  const navigate = useNavigate();

  const onUserSearch = (address) => {
    navigate(`/users/${address}`);
  }

  React.useEffect(() => {
    setIsSearching(true);
    try {
      getPosts(addr).then(items => {
        setUserPostItems(items);
        setIsSearching(false);
      });
    } catch (error) {
      console.error(error);
      setIsSearching(false);
    }
  }, [addr])
  return (
    <>
      <UserSearch searchInput={addr} onSearch={onUserSearch} />
      {isSearching && <ProgressSpinner />}
      <Posts postItems={userPostItems} />
    </>
  );
};

export default App;