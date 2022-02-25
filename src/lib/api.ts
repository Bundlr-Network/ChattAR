import Arweave from 'arweave';
export const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  port: 443
});

export const isWellFormattedAddress = (input) => {
  return input.length > 40;
}

export const createPostData = (node) => {
  const ownerAddress = node.owner.address;
  const height = node.block ? node.block.height : -1;
  const topicTag = node.tags && node.tags.find((a) => a.name === 'Topic');
  const topic = topicTag ? topicTag.value : null;
  const timestamp = node.block ? parseInt(node.block.timestamp, 10) * 1000 : -1;
  let postItem = {
    txid: node.id,
    owner: ownerAddress,
    topic: topic,
    height: height,
    length: node.data.size,
    timestamp: timestamp,
    request: null as any,
    error: ""
  }

  postItem.request = arweave.api.get(`/${node.id}`, { timeout: 10000 })
    .catch(() => { postItem.error = "timeout loading data" });

  return postItem;
}

export const buildQuery = ({ count, address, topic }) => {

  count = Math.min(100, count || 100);

  let ownersFilter = '';
  if (address) {
    ownersFilter = `owners: ["${address}"],`
  }

  let topicFilter = '';
  if (topic) {
    topicFilter = `{
      name: "Topic",
      values: ["${topic}"]
    },`
  }

  const queryObject = {
    query: `{
    transactions(first: ${count}, ${ownersFilter}
      tags: [
        {
          name: "Application",
          values: ["ChattAR"]
        },
        {
          name: "Content-Type",
          values: ["text/plain"]
        },
        ${topicFilter}
      ]
    ) {
      edges {
        node {
          id
          owner {
            address
          }
          data {
            size
          }
          block {
            height
            timestamp
          }
          tags {
            name,
            value
          }
        }
      }
    }
  }`}
  console.log(queryObject.query);
  return queryObject;
}

// in miliseconds
var units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: 24 * 60 * 60 * 1000 * 365 / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000
}

var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export const getRelativeTime = (ts1, ts2) => {
  var elapsed = ts1 - ts2
  // "Math.abs" accounts for both "past" & "future" scenarios
  for (var u in units) {
    if (Math.abs(elapsed) > units[u] || u === 'second') {
      return rtf.format(Math.round(elapsed / units[u]), u as any)
    }
  }
  return rtf.format(Math.round(elapsed / units["second"]), "second" as any)
}

export const getPostTime = (timestamp) => {
  console.log(timestamp)
  if (timestamp < 0) {
    return "pending...";
  }
  return getRelativeTime(timestamp, Date.now());
}

export const abbreviateAddress = (address) => {
  if (!address)
    return address;
  const firstFive = address.substring(0, 5);
  const lastFour = address.substring(address.length - 4);
  return `${firstFive}..${lastFour}`;
}

export const getTopicString = (input) => {
  let dashedTopic = (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return dashedTopic;
}

export const delay = (t): Promise<void> => {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, t);
  });
}

export const delayResults = (milliseconds, results) => {
  return delay(milliseconds).then(function () {
    return results;
  });
}
