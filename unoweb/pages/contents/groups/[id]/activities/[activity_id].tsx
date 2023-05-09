import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ExerciseActivity from "../../../../../components/contents/activities/exercise_activity";
import GameActivity from "../../../../../components/contents/activities/game_activity";
import MediaActivity from "../../../../../components/contents/activities/media_activity";
import QuestionActivity from "../../../../../components/contents/activities/question_activity";
import ErrorCard from "../../../../../components/utils/error_card";
import Loading from "../../../../../components/utils/loading";
import PageHeader from "../../../../../components/utils/page_header";
import { ActiveClassState } from "../../../../../redux/features/active_class";
import { RootState } from "../../../../../redux/store";
import ActivityService from "../../../../../services/activities.service";
import { ActivityType } from "../students/[student_id]/activities/[activity_id]";

interface ActivityPageProps {
  activitygroup_id: number;
  activity_id: number;
}

export default function ActivityPage({
  activitygroup_id,
  activity_id,
}: ActivityPageProps) {
  // On Page Load
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  // Page Data
  const [activity, setActivity] = useState<ActivityType>();

  // Class state (Redux)
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  const [activitygroup_name, setActivityGroupName] = useState("");

  useEffect(() => {
    setIsPageLoading(true);
    ActivityService.getActivity(class_id, activity_id)
      .then((data) => {
        setActivity(data);
        setActivityGroupName(data.activitygroup.name);
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [activity_id, activitygroup_id, class_id]);

  if (isPageLoading) return <Loading />;

  return (
    <>
      <Head>
        <title>UNO - Conteúdos</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container px-4">
        <div className="row g-3 mt-2 mb-4">
          {activity !== undefined && (
            <PageHeader
              header_text={
                activitygroup_name +
                " - " +
                activity.order +
                ". " +
                activity.title
              }
            />
          )}
          {activity === undefined && (
            <PageHeader header_text={activitygroup_name + " - Erro"} />
          )}
        </div>
        {error && (
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter a atividade. Por favor tente novamente." />
          </div>
        )}

        {activity?.activitytype.name === "Media" && (
          <MediaActivity
            student_id={0}
            activitygroup_id={activitygroup_id}
            activity_id={activity_id}
            title={activity.title}
            description={activity.description}
            media_type={activity.media_activity!!.media_type}
            completed={false}
          />
        )}
        {activity?.activitytype.name === "Exercise" && (
          <ExerciseActivity
            student_id={0}
            activitygroup_id={activitygroup_id}
            activity_id={activity_id}
            title={activity.title}
            description={activity.description}
            media_type={activity.exercise_activity!!.media_type}
            completed={false}
          />
        )}
        {activity?.activitytype.name === "Question" && (
          <QuestionActivity
            student_id={0}
            activitygroup_id={activitygroup_id}
            activity_id={activity_id}
            title={activity.title}
            media_type={activity.question_activity!!.media_type}
            completed={false}
            question_info={activity.question_activity!!}
          />
        )}
        {activity?.activitytype.name === "Game" && (
          <GameActivity
            student_id={0}
            activitygroup_id={activitygroup_id}
            activity_id={activity_id}
            title={activity.title}
            description={activity.description}
            game_info={activity.game_activity!!}
            completed={false}
          />
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const activitygroup_id = context.query.id;
  const activity_id = context.query.activity_id;

  return {
    props: {
      activitygroup_id: activitygroup_id,
      activity_id: activity_id,
    },
  };
};