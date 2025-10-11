import Phaser from 'phaser';

type AddSoundConfig = Phaser.Types.Sound.SoundConfig;

const UNLOCKED_EVENT = Phaser.Sound?.Events?.UNLOCKED ?? 'unlocked';

/**
 * Adds a looping background music track to the provided scene that will begin
 * playing as soon as the browser audio context is unlocked. The sound is
 * cleaned up automatically when the scene shuts down.
 */
export function playBackgroundMusic(
    scene: Phaser.Scene,
    key: string,
    config: AddSoundConfig = {}
): Phaser.Sound.BaseSound {
    const music = scene.sound.add(key, { loop: true, ...config });

    const playMusic = () => {
        if (!music.isPlaying) {
            music.play();
        }
    };

    const soundManager = scene.sound;
    let postUpdateRegistered = false;

    if (soundManager.locked) {
        if (typeof soundManager.once === 'function') {
            soundManager.once(UNLOCKED_EVENT, playMusic);
        } else {
            postUpdateRegistered = true;
            scene.events.once(Phaser.Scenes.Events.POST_UPDATE, playMusic);
        }
    } else {
        playMusic();
    }

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        if (typeof soundManager.off === 'function') {
            soundManager.off(UNLOCKED_EVENT, playMusic);
        } else if (typeof (soundManager as Phaser.Events.EventEmitter).removeListener === 'function') {
            (soundManager as Phaser.Events.EventEmitter).removeListener(UNLOCKED_EVENT, playMusic);
        }

        if (postUpdateRegistered) {
            scene.events.off(Phaser.Scenes.Events.POST_UPDATE, playMusic);
        }

        music.stop();
        music.destroy();
    });

    return music;
}