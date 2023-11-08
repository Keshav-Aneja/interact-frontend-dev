import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { MESSAGING_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import postHandler from '@/handlers/post_handler';

import { Chat, User } from '@/types';
import getMessagingUser from '@/utils/get_messaging_user';
import Toaster from '@/utils/toaster';
import { ClipboardText } from '@phosphor-icons/react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface Props {
  user: User;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShareProfile = ({ user, setShow }: Props) => {
  const userID = Cookies.get('id');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userID === '') {
      Toaster.error('You are not logged In.');
      return;
    }

    const URL = `${MESSAGING_URL}/personal`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const chatsData: Chat[] = res.data.chats;

          setChats(chatsData || []);
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
  }, [user]);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  const handleSubmit = async (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();
    if (selectedChats.length == 0) {
      setShow(false);
      return;
    }
    const toaster = Toaster.startLoad('Sharing Profile..');
    const URL = `/share/profile/`;
    const formData = {
      content: message.trim() != '' ? message : 'Checkout this Profile!',
      chats: selectedChats,
      profileID: user.id,
    };
    const res = await postHandler(URL, formData);
    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Opening Profile!', 1);
      setShow(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const handleSelectChat = (chatID: string) => {
    if (selectedChats.includes(chatID)) setSelectedChats(prev => prev.filter(id => id != chatID));
    else setSelectedChats([...selectedChats, chatID]);
  };

  return (
    <>
      <div className="w-1/2 max-md:w-5/6 fixed backdrop-blur-lg bg-white dark:bg-[#ffe1fc22] dark:max-md:bg-[#2a192eea] dark:text-white z-30 translate-x-1/2 -translate-y-1/4 top-64 max-md:top-56 right-1/2 flex flex-col px-8 py-8 gap-6 border-2 border-primary_btn  dark:border-dark_primary_btn rounded-xl animate-fade_third">
        <div className="text-xl text-center font-bold underline underline-offset-2">Share this Profile</div>
        <div className="w-full flex max-md:flex-col gap-4 items-center">
          <div className="w-1/2 max-md:w-full font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg p-4 flex flex-col items-center justify-center gap-4 max-md:gap-4 transition-ease-300 cursor-default">
            <Image
              crossOrigin="anonymous"
              width={10000}
              height={10000}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
              className={'rounded-full max-md:mx-auto w-44 h-44 cursor-default'}
            />
            <div className="text-3xl max-md:text-2xl text-center font-bold text-gradient">{user.name}</div>
            <div className="text-sm text-center">{user.tagline}</div>
            <div className="w-full flex justify-center gap-6">
              <div className="flex gap-1">
                <div className="font-bold">{user.noFollowers}</div>
                <div>Follower{user.noFollowers != 1 ? 's' : ''}</div>
              </div>
              <div className="flex gap-1">
                <div className="font-bold">{user.noFollowing}</div>
                <div>Following</div>
              </div>
            </div>
            <div
              onClick={() => {
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_FRONTEND_URL}/explore/user/${user.username}?action=external`
                );
                Toaster.success('Copied to Clipboard!');
              }}
              className="w-full text-center py-2 flex justify-center gap-2 rounded-lg border-[1px] border-primary_btn dark:border-[#ffe1fc10] 
hover:bg-primary_comp dark:hover:bg-[#ffe1fc10] cursor-pointer transition-ease-200"
            >
              <ClipboardText size={24} />
              <div> Copy Link</div>
            </div>
          </div>
          <div className="w-1/2 max-md:w-full max-h-base_md overflow-auto flex flex-col gap-2">
            {loading ? (
              <Loader />
            ) : (
              <>
                {chats.length > 0 ? (
                  <>
                    {chats.map(chat => {
                      return (
                        <div
                          key={chat.id}
                          onClick={() => {
                            handleSelectChat(chat.id);
                          }}
                          className={`w-full flex gap-2 rounded-lg py-2 px-2 cursor-pointer ${
                            selectedChats.includes(chat.id)
                              ? 'bg-primary_comp_hover dark:bg-[#ffe1fc22]'
                              : 'hover:bg-primary_comp dark:hover:bg-[#ffe1fc10]'
                          } transition-all ease-in-out duration-200`}
                        >
                          <Image
                            crossOrigin="anonymous"
                            width={10000}
                            height={10000}
                            alt={'User Pic'}
                            src={`${USER_PROFILE_PIC_URL}/${getMessagingUser(chat).profilePic}`}
                            className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                          />
                          <div className="w-5/6 flex flex-col">
                            <div className="text-lg font-bold">{getMessagingUser(chat).name}</div>
                            <div className="text-sm">@{getMessagingUser(chat).username}</div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
              </>
            )}
            <form onSubmit={el => handleSubmit(el)} className="w-full flex flex-col gap-1">
              <textarea
                className="bg-[#ffe1fc22] text-sm focus:outline-none p-2 rounded-xl min-h-[6rem] max-h-64"
                placeholder="Add a message"
                value={message}
                onChange={el => setMessage(el.target.value)}
              />
              <button
                type="submit"
                className="w-full text-center py-2 rounded-lg border-[1px] border-primary_btn dark:border-[#ffe1fc10] bg-primary_comp dark:bg-transparent hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-[#ffe1fc10] dark:active:bg-dark_primary_comp_active cursor-pointer transition-ease-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen max-md:h-base fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default ShareProfile;
