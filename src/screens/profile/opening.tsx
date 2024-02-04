import { useEffect, useState } from 'react';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { Opening } from '@/types';
import OpeningCard from '@/components/explore/opening_card';
import NewOpening from '@/sections/organization/openings/new_opening';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { initialOpening } from '@/types/initials';
import OpeningView from '@/sections/explore/opening_view';

interface Props {
  orgID: string;
}

export default function Openings({ orgID }: Props) {
  const [clickedOnNewOpening, setClickedOnNewOpening] = useState(false);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [clickedOnOpening, setClickedOnOpening] = useState(false);
  const [clickedOpening, setClickedOpening] = useState(initialOpening);

  useEffect(() => {
    const getOpenings = async () => {
      const URL = `/org/${orgID}/org_openings`;
      const res = await getHandler(URL);
      if (res.statusCode === 200) {
        setOpenings(res.data.openings || []);
        return;
      } else {
        if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
        else {
          Toaster.error(SERVER_ERROR, 'error_toaster');
        }
      }
    };
    getOpenings();
  }, []);
  return (
    <>
      {clickedOnNewOpening && checkOrgAccess(ORG_MANAGER) ? (
        <NewOpening setShow={setClickedOnNewOpening} openings={openings} setOpenings={setOpenings} />
      ) : (
        <></>
      )}
      <div className="w-4/5 relative mx-auto flex flex-col gap-4 pb-2">
        {clickedOnOpening ? (
          <OpeningView
            opening={clickedOpening}
            setOpening={setClickedOpening}
            setShow={setClickedOnOpening}
            showBack={true}
            org={true}
            fullWeight={true}
          />
        ) : (
          openings.map((opening, index) => {
            return (
              <OpeningCard
                setClickedOnOpening={setClickedOnOpening}
                key={index}
                opening={opening}
                setClickedOpening={setClickedOpening}
                org={true}
              />
            );
          })
        )}
      </div>
    </>
  );
}