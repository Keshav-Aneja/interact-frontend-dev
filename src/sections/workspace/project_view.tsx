import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project } from '@/types';
import { initialProject } from '@/types/initials';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';

interface Props {
  projectSlugs: string[];
  clickedProjectIndex: number;
  setClickedProjectIndex: React.Dispatch<React.SetStateAction<number>>;
  setClickedOnProject: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProjectView = ({ projectSlugs, clickedProjectIndex, setClickedProjectIndex, setClickedOnProject }: Props) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [loading, setLoading] = useState(true);

  const fetchProject = async (abortController: AbortController) => {
    setLoading(true);
    let slug = '';
    try {
      slug = projectSlugs[clickedProjectIndex];
    } finally {
      const URL = `${EXPLORE_URL}/projects/${slug}`;
      const res = await getHandler(URL, abortController.signal);
      if (res.statusCode == 200) {
        setProject(res.data.project);
        setLoading(false);
      } else {
        if (res.status != -1) {
          if (res.data.message) Toaster.error(res.data.message);
          else Toaster.error(SERVER_ERROR);
        }
      }
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchProject(abortController);
    return () => {
      abortController.abort();
    };
  }, [clickedProjectIndex]);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <div className="w-screen h-screen fixed top-0 left-0 z-50 flex bg-[#000000a5] backdrop-blur-sm animate-fade_third">
      <div className="w-16 h-screen flex flex-col items-center justify-between">
        <div className="w-12 h-12 rounded-full bg-white"></div>
        {clickedProjectIndex != 0 ? (
          <div
            onClick={() => setClickedProjectIndex(prev => prev - 1)}
            className="w-12 h-12 rounded-full bg-white"
          ></div>
        ) : (
          <></>
        )}
      </div>

      <div className="w-[calc(100vw-128px)] h-screen ">
        <div className="w-full h-16">
          <div>{project.title}</div>
          <div>{project.user.name}</div>
        </div>
        <div className="w-full h-base flex bg-white max-md:flex-col">
          <div className="w-3/4 max-md:w-full h-full">{loading ? <Loader /> : <></>}</div>
          <div className="w-1/4 max-md:w-full h-full bg-slate-200"></div>
        </div>
      </div>

      <div className="w-16 h-screen flex flex-col items-center justify-between">
        <div onClick={() => setClickedOnProject(false)} className="w-12 h-12 rounded-full bg-red-400 cursor-pointer">
          X
        </div>
        {loading ? (
          <></>
        ) : (
          <div className="flex flex-col gap-4">
            {project.openings.length > 0 ? <div className="w-12 h-12 rounded-full bg-white">C</div> : <></>}
            <div className="w-12 h-12 rounded-full bg-white"></div>
            <div className="w-12 h-12 rounded-full bg-white"></div>
            <div className="w-12 h-12 rounded-full bg-white"></div>
          </div>
        )}

        {clickedProjectIndex != projectSlugs.length - 1 ? (
          <div
            onClick={() => setClickedProjectIndex(prev => prev + 1)}
            className="w-12 h-12 rounded-full bg-white"
          ></div>
        ) : (
          <div className="w-12 h-12 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;
