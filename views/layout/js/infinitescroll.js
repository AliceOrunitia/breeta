// Time calls for Breet Cards
function likeCounter(arr) {
  return arr.length;
}

function isS(num) {
  return num > 1 ? "s " : " ";
}

function timeAgo(mill) {
  let string = "";
  const seconds = Math.floor(mill / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return (string = days
    ? `${days} day${isS(days)}ago`
    : hours
    ? `${hours} hour${isS(hours)}ago`
    : minutes
    ? `${minutes} minute${isS(minutes)}ago`
    : `${seconds} second${isS(seconds)}ago`);
}

function timeCall(time) {
  const parsedTime = Date.parse(time);
  const now = Date.now();
  return timeAgo(parseInt(now - parsedTime));
}

// Document Selectors
const cardContainer = document.getElementById("main-feed");
const loader = document.getElementById("loader");

const cardLimit = 100;
const cardIncrease = 20;
const pageCount = Math.ceil(cardLimit / cardIncrease);
let currentPage = 1;

var throttleTimer;
const throttle = (callback, time) => {
  if (throttleTimer) return;

  throttleTimer = true;

  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};

const createCard = (breet, sessionUser) => {
  const breetContainer = document.createElement("div");
  breetContainer.setAttribute("id", "breet-container");
  breetContainer.setAttribute("class", "card my-3");
  breetContainer.setAttribute("style", "max-width: 600px;");
  let builder = `<div class="row"><div class="col-3 col-sm-2 ms-2 mt-4"><img src="https://res.cloudinary.com/breeta/image/upload/c_thumb,w_200,g_face/${breet.pfp.slice(
    47
  )}" class="img-fluid img-thumbnail rounded-circle" alt="..."></div>`;
  if (breet.rebreeter || breet.parent) {
    builder += `<div class="col"><div class="card-body p0">`;
  } else {
    builder += `<div class="col"><div class="card-body pb-0">`;
  }
  if (breet.rebreeter) {
    builder += `<h6 class="text-muted fw-light align-top"> <i class="bi bi-arrow-repeat"></i> Rebreeted By <a href="/users/${breet.username}" class="link-unstyled">@${breet.username}</a></h6>`;
  } else if (breet.parent) {
    builder += `<h6 class="text-muted fw-light align-top"> <i class="bi bi-chat"></i> In reply to <a href="/breeta/${breet.parent._id}" class="link-unstyled">@${breet.parent.username}</a></h6>`;
  }
  const iconFiller = sessionUser.following.includes(breet.username)
    ? "fill-slash"
    : sessionUser.username !== breet.username
    ? "heart"
    : "";
  builder += `<div class="card-title h5 mb-4">${breet.dName} <a href="/users/${breet.username}" class="link-unstyled"><span class="h6 text-muted">@${breet.username}</span></a><form action="/users/${breet.username}" method="post" style=" display:inline!important;"><button id="followButton"><i class="bi bi-person-${iconFiller} h6"></i></button></form></div><a href="/breeta/${breet._id}"class="link-unstyled"><p class="card-text border rounded-3 py-4 px-3">${breet.content}</p></a>`;

  if (breet.image) {
    builder += `<div><img src="${breet.image.url}" class="ml-0" alt="${breet.image.filename}" style="max-height: 200px; object-fit:contain;"></div>`;
  }
  builder += `<p class="card-text mb-0 mt-4"><a href="/breeta/${
    breet._id
  }/like" class="link-unstyled"><button class="btn ps-0 pb-2"><i class="bi bi-heart"></i></button>${
    breet.likes
  }</a><a href="/breeta/${
    breet._id
  }/reply" class="link-unstyled"><button class="btn pb-2"><i class="bi bi-chat"></i></button>${
    breet.replies
  }</a><a href="/breeta/${
    breet._id
  }/rebreet" class="link-unstyled"><button class="btn pb-2"><i class="bi bi-arrow-repeat"></i></button>${
    breet.rebreets
  }</a><p class="mb-0"><small class="text-muted align-text-top"> Posted ${timeCall(
    breet.time
  )}</small></p></div></div></div>`;
  breetContainer.innerHTML = builder;
  cardContainer.append(breetContainer);
};

const addCards = (pageIndex, breets, sessionUser) => {
  currentPage = pageIndex;

  const startRange = (pageIndex - 1) * cardIncrease;
  const endRange =
    currentPage == pageCount ? cardLimit : pageIndex * cardIncrease;

  let breet;
  for (let i = 0; i < breets.length; i++) {
    breet = breets[i];
    createCard(breet, sessionUser);
  }
    loader.setAttribute("style", "display: none;");
};

const handleInfiniteScroll = async () => {
  throttle(async () => {
    const endOfPage =
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
    if (endOfPage && document.body.offsetHeight > window.innerHeight + 100) {
      loader.setAttribute("style", "display: block;");
      const getter = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3005/breeta/scroller"
          );
          const data = response.data;
          return data;
        } catch (e) {
          return e;
        }
      };
      const { breets, sessionUser } = await getter();
      if (breets.length < 20) {
        removeInfiniteScroll();
      }
      addCards(currentPage + 1, breets, sessionUser);
    }
    if (currentPage === pageCount) {
      removeInfiniteScroll();
    }
  }, 1000);
};

const removeInfiniteScroll = () => {
  loader.remove();
  window.removeEventListener("scroll", handleInfiniteScroll);
};

window.onload = function () {};

window.addEventListener("scroll", handleInfiniteScroll);
