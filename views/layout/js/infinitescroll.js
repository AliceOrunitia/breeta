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
  breetContainer.setAttribute("class", "card my-3 ms-md-3 ms-1 pe-0 shadow-sm");
  breetContainer.setAttribute("style", "max-width: 700px;");
  let builder = `<div class="row"><div class="col-2 mt-4 px-0 ms-3"><img src="https://res.cloudinary.com/breeta/image/upload/c_thumb,g_face,h_400,w_400/r_max/c_scale,w_200/${breet.pfp.slice(
    47
  )}" class="img-fluid shadow img-thumbnail rounded-circle" alt="..."></div>`;
  if (breet.rebreeter || breet.parent) {
    builder += `<div class="col px-0 me-md-2"><div class="card-body py-0">`;
  } else {
    builder += `<div class="col px-0 me-md-2"><div class="card-body pb-0">`;
  }
  if (breet.rebreeter) {
    builder += `<h6 class="text-muted fw-light mb-0 my-md-1"> <small><i class="bi bi-arrow-repeat"></i> Rebreeted By <a href="/users/${breet.username}" class="link-unstyled">@${breet.username}</small></a></h6>`;
  } else if (breet.parent) {
    builder += `<h6 class="text-muted fw-light mb-0 my-md-1"> </small><i class="bi bi-chat"></i> In reply to <a href="/breeta/${breet.parent._id}" class="link-unstyled">@${breet.parent.username}</small></a></h6>`;
  }
  const iconFiller = sessionUser.following.includes(breet.username)
    ? "fill-slash"
    : sessionUser.username !== breet.username
    ? "heart"
    : "";
  builder += `<div class="card-title h5 mb-3 fw-bold">${breet.dName} <a href="/users/${breet.username}" class="link-unstyled"><span class="h6 text-muted ms-1">@${breet.username}</span></a><form action="/users/${breet.username}" method="post" style=" display:inline!important;"><button id="followButton" class="shadow rounded-circle p-2 float-end me-1"><i class="bi bi-person-${iconFiller} h6"></i></button></form></div><a href="/breeta/${breet._id}"class="link-unstyled"><p class="card-text h6 border shadow-sm rounded-3 py-4 px-3 mb-md-3"><small>${breet.content}</small></p></a>`;

  if (breet.image) {
    builder += `<div><img src="${breet.image.url}" class="ml-0 mt-2 mt-md-0 rounded" alt="${breet.image.filename}" style="max-height: 200px; object-fit:contain;"></div>`;
  }
  builder += `<p class="card-text my-2"><a href="/breeta/${
    breet._id
  }/like" class="link-unstyled"><span class="md-h5 border border-2 rounded-pill p-md-2 shadow-sm px-2 py-md-1"><i class="bi bi-heart"></i> ${
    breet.likes
  }</span></a><a href="/breeta/${
    breet._id
  }/reply" class="link-unstyled"><span class="md-h5 border border-2 rounded-pill p-md-2 shadow-sm px-2 py-md-1"><i class="bi bi-chat"></i> ${
    breet.replies
  }</span></a><a href="/breeta/${
    breet._id
  }/rebreet" class="link-unstyled"><span class="md-h5 border border-2 rounded-pill p-md-2 shadow-sm px-2 py-md-1 mx-1"><i class="bi bi-arrow-repeat"></i> ${
    breet.rebreets
  }</span></a><p class="mb-0 mb-md-1 ms-1"><small class="text-muted align-text-top"><i class="bi bi-calendar-event"></i> Posted ${timeCall(
    breet.time
  )}</small></p></div></div></div></div>`;
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
            "/breeta/scroller"
          );
          const data = response.data;
          return data;
        } catch (e) {
           console.log(e);
          return {breets: [], sessionUser: null};
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
