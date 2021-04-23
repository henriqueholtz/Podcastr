import { useContext, useEffect, useRef } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { PlayerContext } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';

export default function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const { episodeList, currentEpisodeIndex, isPlaying, togglePlay, setPlayingState } = useContext(PlayerContext);
    const episode = episodeList[currentEpisodeIndex];

    useEffect(() => {
        if(!audioRef.current) {
            return;
        }

        if(isPlaying)
            audioRef.current.play();
        else
            audioRef.current.pause();
    }, [isPlaying])

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Playing now" />
                <strong>Playing now</strong>
            </header>
            
            {episode ? (
                <div className={styles.currentEpisode}>
                    <Image width={592} height={592} src={episode.thumbnail} objectFit="cover" />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer} >
                    <strong>Select one Podcast to hear</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>00:00</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider trackStyle={{backgroundColor: '#84d361'}} railStyle={{ backgroundColor: '#9f75ff'}} handleStyle={{ borderColor: '#84d361', borderWidth: 4}} />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>
                    <span>00:00</span>
                </div>

                { episode && (
                    <audio src={episode.url} autoPlay ref={audioRef} onPlay={() => setPlayingState(true)} onPause={() => setPlayingState(false)} />
                )}

                <div className={styles.buttons}>
                    <button type="button" disabled={!episode}>
                        <img src="/shuffle.svg" alt="mix"/>
                    </button>
                    
                    <button type="button" disabled={!episode}>
                        <img src="/play-previous.svg" alt="Play previous"/>
                    </button>
                    
                    <button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
                        <img src={isPlaying ? '/pause.svg' : '/play.svg'} alt="Play"/>
                    </button>
                    
                    <button type="button" disabled={!episode}>
                        <img src="/play-next.svg" alt="Play next"/>
                    </button>
                    
                    <button type="button" disabled={!episode}>
                        <img src="/repeat.svg" alt="repeat"/>
                    </button>
                </div>
            </footer>
        </div>
    )
}