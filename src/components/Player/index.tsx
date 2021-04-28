import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import { ConvertDurationToTimeString } from '../../utils/Date';
import Sound from '../SliderSound/Sound';

export default function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const { episodeList, currentEpisodeIndex, isPlaying, togglePlay, toggleLoop, toggleShuffle, setPlayingState, playNext, playPrevious, hasNext, hasPrevious, isLooping, isShuffling, clearPlayerState } = usePlayer();
    const episode = episodeList[currentEpisodeIndex];
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [enbaleSoundChange, setEnbaleSoundChange] = useState(false)

    useEffect(() => {
        setEnbaleSoundChange(false);
    }, [episode, isPlaying])

    useEffect(() => {
        setTimeout(() => {
            setEnbaleSoundChange(false);
          }, 5000);
    }, [volume])

    useEffect(() => {
        if(!audioRef.current) {
            return;
        }

        if(isPlaying)
            audioRef.current.play();
        else
            audioRef.current.pause();
    }, [isPlaying])

    function setupProgressListner() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if(hasNext){
            playNext();
        }
        else {
            clearPlayerState();
        }
    }

    function toggleVolume(amount: number) { 
        audioRef.current.volume = amount
        setVolume(amount)
    }

    function toggleVolumeChange() {
        setEnbaleSoundChange(!enbaleSoundChange);
    }

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
                    <span>{ConvertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider max={episode.duration} value={progress} onChange={handleSeek} trackStyle={{backgroundColor: '#84d361'}} railStyle={{ backgroundColor: '#9f75ff'}} handleStyle={{ borderColor: '#84d361', borderWidth: 4}} />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>
                    <span>{ConvertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode && (
                    <audio src={episode.url} autoPlay loop={isLooping} ref={audioRef} onPlay={() => setPlayingState(true)} onPause={() => setPlayingState(false)} onLoadedMetadata={setupProgressListner} onEnded={handleEpisodeEnded} />
                )}

                <div className={styles.buttons}>
                    <button type="button" disabled={!episode || episodeList.length === 1} onClick={toggleShuffle} className={isShuffling ? styles.isActive : ''}>
                        <img src="/shuffle.svg" alt="mix"/>
                    </button>
                    
                    <button type="button" disabled={!episode || !hasPrevious} onClick={() => playPrevious()}>
                        <img src="/play-previous.svg" alt="Play previous"/>
                    </button>
                    
                    <button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
                        <img src={isPlaying ? '/pause.svg' : '/play.svg'} alt="Play"/>
                    </button>
                    
                    <button type="button" disabled={!episode || !hasNext} onClick={() => playNext()}>
                        <img src="/play-next.svg" alt="Play next"/>
                    </button>
                    
                    <button type="button" disabled={!episode} onClick={toggleLoop} className={isLooping ? styles.isActive : ''} >
                        <img src="/repeat.svg" alt="repeat"/>
                    </button>

                    <div className={styles.soundWrapper}>
                        <button type="button" disabled={!episode} onClick={toggleVolumeChange}>
                            <Sound width={28} height={28} />
                        </button>
                        
                        {enbaleSoundChange && episode && (
                            <Slider className={styles.sliderSound} vertical value={volume} onChange={toggleVolume} trackStyle={{backgroundColor: '#84d361'}} railStyle={{ backgroundColor: '#9f75ff'}} handleStyle={{ borderColor: '#84d361', borderWidth: 4}} min={0} max={1} step={0.05}/>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    )
}