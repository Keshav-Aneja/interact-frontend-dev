import Loader from '@/components/common/loader';
import NoSearch from '@/components/empty_fillers/search';
import OpeningCard from '@/components/explore/opening_card';
import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL, OPENING_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import OpeningView from '@/sections/explore/opening_view';
import { Opening } from '@/types';
import { initialOpening } from '@/types/initials';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const Openings = () => {
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [clickedOnOpening, setClickedOnOpening] = useState(false);
  const [clickedOpening, setClickedOpening] = useState(initialOpening);

  const fetchOpenings = async (search: string | null) => {
    let URL =
      search && search != ''
        ? `${EXPLORE_URL}/openings/trending?${'search=' + search}`
        : `${EXPLORE_URL}/openings/recommended?page=${page}&limit=${10}`;

    const projectSlug = new URLSearchParams(window.location.search).get('project');
    if (projectSlug) URL = `${EXPLORE_URL}/openings/${projectSlug}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      if (search && search != '') setOpenings(res.data.openings || []);
      else {
        const addedOpenings = [...openings, ...(res.data.openings || [])];
        if (addedOpenings.length === openings.length) setHasMore(false);
        setOpenings(addedOpenings);
        setPage(prev => prev + 1);
        if (clickedOnOpening) {
          if (addedOpenings.length > 0) setClickedOpening(addedOpenings[0]);
          else {
            setClickedOnOpening(false);
            setClickedOpening(initialOpening);
          }
        }
      }
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const fetchOpening = async (id: string | null) => {
    setLoading(true);
    const URL = `${OPENING_URL}/${id}`;

    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setOpenings([res.data.opening] || []);

      if (res.data.opening) {
        setClickedOpening(res.data.opening || initialOpening);
        setClickedOnOpening(true);
      }

      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    const oid = new URLSearchParams(window.location.search).get('oid');
    if (oid && oid != '') fetchOpening(oid);
    else fetchOpenings(new URLSearchParams(window.location.search).get('search'));
  }, [window.location.search]);

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      {loading ? (
        <Loader />
      ) : (
        <>
          {openings.length > 0 ? (
            <div className="flex justify-evenly px-4">
              <InfiniteScroll
                className={`${clickedOnOpening ? 'w-full' : 'w-[720px]'} max-md:w-full flex flex-col gap-4`}
                dataLength={openings.length}
                next={() => fetchOpenings(new URLSearchParams(window.location.search).get('search'))}
                hasMore={hasMore}
                loader={<Loader />}
              >
                {openings.map(opening => {
                  return (
                    <OpeningCard
                      key={opening.id}
                      opening={opening}
                      clickedOpening={clickedOpening}
                      setClickedOnOpening={setClickedOnOpening}
                      setClickedOpening={setClickedOpening}
                    />
                  );
                })}
              </InfiniteScroll>
              {clickedOnOpening ? (
                <OpeningView opening={clickedOpening} setShow={setClickedOnOpening} setOpening={setClickedOpening} />
              ) : (
                <></>
              )}
            </div>
          ) : (
            <NoSearch />
          )}
        </>
      )}
    </div>
  );
};

export default Openings;
