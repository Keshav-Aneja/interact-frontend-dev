import ProjectCard from '@/components/explore/project_card';
import { Event, Project } from '@/types';
import React, { useEffect, useState } from 'react';
import ProjectView from '../../sections/explore/project_view';
import { useSelector } from 'react-redux';
import { navbarOpenSelector } from '@/slices/feedSlice';
import NewProject from '@/sections/workspace/new_project';
import NoUserItems from '@/components/empty_fillers/user_items';
import { EXPLORE_URL, ORG_URL } from '@/config/routes';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '@/components/common/loader';
import { currentOrgSelector } from '@/slices/orgSlice';
import { initialEvent } from '@/types/initials';
import projects from './projects';
import EventCard from '@/components/explore/event_card';

interface Props {
  orgID: string;
  displayOnProfile?: boolean;
}

const Events = ({ orgID, displayOnProfile = false }: Props) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clickedOnNewEvent, setClickedOnNewEvent] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);

  const getEvents = () => {
    const URL = `${ORG_URL}/${orgID}/events?page=${page}&limit=${10}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const addEvents = [...events, ...(res.data.events || [])];
          if (addEvents.length === events.length) setHasMore(false);
          setEvents(addEvents);
          setPage(prev => prev + 1);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <div className="w-[45vw] mx-auto max-md:pb-2 z-50">
      {/* {displayOnProfile ? (
        <>
          {clickedOnNewProject ? <NewProject setShow={setClickedOnNewProject} setProjects={setProjects} /> : <></>}
          <div
            onClick={() => setClickedOnNewProject(true)}
            className={`mb-8 w-108 max-md:w-5/6 h-24 max-md:hover:scale-105 hover:scale-125 group relative overflow-clip bg-white hover:bg-[#f3f3f3] mx-auto border-[1px] pattern1 rounded-lg cursor-pointer flex-center flex-col transition-ease-300`}
          >
            <div className="backdrop-blur-md opacity-0 group-hover:opacity-60 w-2/3 h-2/3 rounded-xl transition-ease-out-300"></div>
            <div className="font-extrabold text-xl group-hover:text-2xl text-gradient absolute translate-y-0 group-hover:-translate-y-2 transition-ease-out-300">
              Create a new Project!
            </div>
            <div className="text-xs font-semibold text-primary_black absolute translate-x-0 translate-y-16 group-hover:translate-y-4 transition-ease-out-300">
              Woohooh! New Project! Who Dis?
            </div>
          </div>
        </>
      ) : (
        <></>
      )} */}
      {loading ? (
        <Loader />
      ) : (
        <InfiniteScroll
          dataLength={events.length}
          next={getEvents}
          hasMore={hasMore}
          loader={<Loader />}
          className="w-full flex flex-wrap px-4 pb-12 gap-6"
        >
          {events.map(event => (
            <EventCard key={event.id} event={event} size={80} />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Events;
