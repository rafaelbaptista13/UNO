import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import StudentActivityCard from "../../../../../../components/contents/student_activity_card";
import ErrorCard from "../../../../../../components/utils/error_card";
import Loading from "../../../../../../components/utils/loading";
import PageHeader from "../../../../../../components/utils/page_header";
import { ActiveClassState } from "../../../../../../redux/features/active_class";
import { RootState } from "../../../../../../redux/store";
import ActivityService from "../../../../../../services/activities.service";
import { ButtonPrimary } from "../../../../../../utils/buttons";
import { activities_type } from "../../../edit/[id]";

export type ActivityTypeType = {
  id: number;
  name: string;
};

export type ActivitiesType = {
  id: number;
  activitytype: ActivityTypeType;
  order: number;
  activitygroup_id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

interface StudentActivityGroupPageProps {
  activitygroup_id: number;
  student_id: number;
}

export default function StudentActivityGroupPage({
  activitygroup_id,
  student_id,
}: StudentActivityGroupPageProps) {
  // On Page Load
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState(false);

  // Page Data
  const [activities, setActivities] = useState<Array<ActivitiesType>>([]);

  // Class state (Redux)
  const { id: class_id } = useSelector<RootState, ActiveClassState>(
    (state) => state.active_class
  );

  const [activitygroup_name, setActivityGroupName] = useState("");
  const [student_name, setStudentName] = useState("");

  useEffect(() => {
    setIsPageLoading(true);
    ActivityService.getActivitiesOfStudent(
      class_id,
      activitygroup_id,
      student_id
    )
      .then((data) => {
        setActivities(data.activities);
        setActivityGroupName(data.name);
        setStudentName(data.first_name + " " + data.last_name);
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [activitygroup_id, class_id, student_id]);

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
          <PageHeader header_text={activitygroup_name + " - " + student_name} />
        </div>
        {error && (
          <div className="row g-3 my-2">
            <ErrorCard message="Ocorreu um erro ao obter os grupos de atividades. Por favor tente novamente." />
          </div>
        )}

        {activities.map(function (activity: ActivitiesType, index) {
          return (
            <div className="row g-3 my-1" key={activity.id}>
              <StudentActivityCard
                activitygroup_id={activitygroup_id}
                student_id={student_id}
                activity_id={activity.id}
                completed={activity.completed}
                title={activity.title}
                type={activity.activitytype.name}
                description={activities_type[activity.activitytype.name]}
              />
            </div>
          );
        })}

        <div className="row g-3 my-2">
          <div className="col gap-3 d-flex justify-content-end">
            <Link
              href={`/contents/groups/${activitygroup_id}/students`}
            >
              <ButtonPrimary>Voltar</ButtonPrimary>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const activitygroup_id = context.query.id;
  const student_id = context.query.student_id;

  return {
    props: {
      activitygroup_id: activitygroup_id,
      student_id: student_id,
    },
  };
};