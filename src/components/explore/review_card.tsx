import { Review } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { CaretDown, CaretUp, Star, Trash, WarningCircle } from '@phosphor-icons/react';
import moment from 'moment';
import Toaster from '@/utils/toaster';
import deleteHandler from '@/handlers/delete_handler';
import { SERVER_ERROR } from '@/config/errors';
import ConfirmDelete from '../common/confirm_delete';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import LowerReview from '../lowers/lower_review';
import { ORG_MANAGER } from '@/config/constants';

interface Props {
  review: Review;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

const ReviewCard = ({ review, setReviews }: Props) => {
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);

  const handleDelete = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Deleting your review...');

    const URL = `${ORG_URL}/${review.organizationID}/reviews/${review.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      setReviews(prev => prev.filter(r => r.id != review.id));

      Toaster.stopLoad(toaster, 'Review Deleted!', 1);
    } else {
      if (res.data.message != '') Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <>
      {clickedOnDelete ? <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} /> : <></>}
      <div
        key={review.id}
        className="w-5/6 flex flex-col gap-4 bg-white relative group hover:shadow-xl p-6 rounded-xl transition-ease-300"
      >
        {user.id == review.userID ? (
          <div
            onClick={el => setClickedOnDelete(true)}
            className=" hover:shadow-lg text-gray-500 text-xxs px-2 py-1 flex gap-2 absolute opacity-0 group-hover:opacity-100 top-2 right-2 transition-ease-300 rounded-lg "
          >
            <Trash onClick={() => setClickedOnDelete(true)} className="cursor-pointer" size={18} />
          </div>
        ) : user.organizationMemberships
            .filter(m => m.role == ORG_MANAGER)
            .map(m => m.organizationID)
            .includes(review.organizationID) ? (
          //TODO Report Review
          <div
            onClick={el => setClickedOnDelete(true)}
            className=" hover:shadow-lg text-gray-500 text-xxs px-2 py-1 flex gap-2 absolute opacity-0 group-hover:opacity-100 top-2 right-2 transition-ease-300 rounded-lg "
          >
            <WarningCircle onClick={() => setClickedOnDelete(true)} className="cursor-pointer" size={18} />
          </div>
        ) : (
          <></>
        )}

        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              crossOrigin="anonymous"
              width={100}
              height={100}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${review.isAnonymous ? 'default.jpg' : review.user.profilePic}`}
              className={'rounded-full w-10 h-10'}
            />
            <div className="w-fit">
              <div className="text-xl font-medium">{review.isAnonymous ? 'Anonymous' : review.user.name}</div>
              <div className="text-xs">@{!review.isAnonymous ? review.user.username : 'interact_user'}</div>
            </div>
          </div>
          <div className="text-gray-400 font-medium text-xs">{moment(review.createdAt).fromNow()}</div>
        </div>

        <div className="w-full flex justify-between items-center">
          <LowerReview review={review} />
          <div className="w-fit flex gap-1">
            <Star size={20} weight={review.rating >= 1 ? 'fill' : 'regular'} />
            <Star size={20} weight={review.rating >= 2 ? 'fill' : 'regular'} />
            <Star size={20} weight={review.rating >= 3 ? 'fill' : 'regular'} />
            <Star size={20} weight={review.rating >= 4 ? 'fill' : 'regular'} />
            <Star size={20} weight={review.rating == 5 ? 'fill' : 'regular'} />
          </div>
        </div>

        <div className="text-primary_black text-sm">{review.content}</div>
      </div>
    </>
  );
};

export default ReviewCard;
