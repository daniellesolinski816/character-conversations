import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import BookClubs from './pages/BookClubs';
import ClubDetail from './pages/ClubDetail';
import Discussion from './pages/Discussion';
import Community from './pages/Community';
import Challenges from './pages/Challenges';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BookDetail": BookDetail,
    "Reader": Reader,
    "BookClubs": BookClubs,
    "ClubDetail": ClubDetail,
    "Discussion": Discussion,
    "Community": Community,
    "Challenges": Challenges,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};