import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, setFollowing } from '@/slices/userSlice';
import Cookies from 'js-cookie';
import Toaster from '@/utils/toaster';
import getHandler from '@/handlers/get_handler';
import { configSelector, setFetchingFollowing } from '@/slices/configSlice';

interface Props {
  setFollowerCount?: React.Dispatch<React.SetStateAction<number>>;
  toFollowID: string;
}

const FollowBtn = ({ toFollowID, setFollowerCount }: Props) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const following = useSelector(userSelector).following;
  const updatingFollowing = useSelector(configSelector).fetchingFollowing;
  const dispatch = useDispatch();

  const userID = Cookies.get('id');

  useEffect(() => {
    if (following.includes(toFollowID)) setIsFollowing(true);
  }, [toFollowID]);

  class Semaphore {
    private waiting: Array<() => void>;

    constructor() {
      this.waiting = [];
    }

    async acquire() {
      if (!updatingFollowing) {
        dispatch(setFetchingFollowing(true));
      } else {
        await new Promise<void>(resolve =>
          this.waiting.push(() => {
            this.acquire();
            resolve();
            this.release();
          })
        );
      }
    }

    release() {
      dispatch(setFetchingFollowing(false));
      const next = this.waiting.shift();
      if (next) {
        next(); //! not working
      }
    }
  }

  const globalSemaphore = new Semaphore();

  const submitHandler = async () => {
    await globalSemaphore.acquire();

    const newFollowing = [...following];
    if (setFollowerCount) {
      if (isFollowing) {
        setFollowerCount(prev => prev - 1);
      } else {
        setFollowerCount(prev => prev + 1);
      }
    }
    setIsFollowing(prev => !prev);

    const res = await getHandler(`/${isFollowing ? 'un' : ''}follow/${toFollowID}`);
    if (res.statusCode === 200) {
      if (isFollowing) {
        newFollowing.splice(newFollowing.indexOf(toFollowID), 1);
      } else {
        newFollowing.push(toFollowID);
      }
      dispatch(setFollowing(newFollowing));
    } else {
      if (setFollowerCount) {
        if (isFollowing) {
          setFollowerCount(prev => prev + 1);
        } else {
          setFollowerCount(prev => prev - 1);
        }
      }
      setIsFollowing(prev => !prev);
      Toaster.error(res.data.message);
    }

    globalSemaphore.release();
  };

  return (
    <>
      {toFollowID !== userID ? (
        <div
          onClick={submitHandler}
          className={`${
            isFollowing ? 'w-20 border-2 border-black' : 'w-16 bg-black text-white'
          } h-8 rounded-3xl flex justify-center items-center cursor-pointer text-sm transition-ease-150`}
        >
          {isFollowing ? 'following' : 'follow'}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default FollowBtn;