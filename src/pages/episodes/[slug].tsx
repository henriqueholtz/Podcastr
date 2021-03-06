import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'
import Image from 'next/image';
import Link from 'next/link'
import { useRouter } from 'next/router'
import { format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../../services/api';
import { ConvertDurationToTimeString } from '../../utils/Date';
import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';

//Important: 'Slug' can be replaced by any word.

type Episode = {
    id: string;
    title: string;
    members: string;
    publishedAt: string;
    thumbnail: string;
    duration: number;
    durationAsString: string;
    url: string;
    description: string;
}

type EpisodeProps = {
    episode: Episode
}

export default function Episode({episode}: EpisodeProps) {
    const router = useRouter();
    const { play } = usePlayer();

    if (router.isFallback) {
        //only necessary if fallback: true
        return <p>Loading...</p>
    }
    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Back to last page"/>
                    </button>
                </Link>
                <Image width={700} height={160} src={episode.thumbnail} objectFit="cover"/>
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Play episode"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description}}/>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    });

    const paths = data.map(ep => {
        return {
            params: {
                slug: ep.id
            }
        }
    })

    return {
        paths: paths,
        fallback: 'blocking' //if 'fallback: blocking', then only open the page when the request is complete
        //if 'fallback: false', then 404 for pages without static page
        //if 'fallback: true', then request from server from client
    }
}

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params;
    const { data } = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
          locale: ptBR
        }),
        duration: Number(data.file.duration),
        durationAsString: ConvertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url
    }

    return {
        props:{
            episode
        },
        revalidate: 60 * 60 * 24 // 24hours
    }
}