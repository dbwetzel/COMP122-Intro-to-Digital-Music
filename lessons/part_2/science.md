<link href="../../markdown.css" rel="stylesheet"></link> 

# The Science of Sound: Fundamental Principles
*Some essential concepts and terms*

**What is Sound?** Is it a *physical* phenomenon (a vibration through a medium)? Or is it a *perceptual* phenomenon (the product of our nervous system and neural processes)? *Is it both?*

What is the difference between hearing and listening? Is it just about our ears? Can ordinary sounds be "musical?"

Many of the great pioneers of electronic and computer music (Pauline Oliveros, Alvin Lucier, Edgard Varese, etc.)  were motivated more by these questions and by the quest for a "deep listening" experience than they ever were by the novelty of their electronic gadgets.

The attraction for many seems to be that electronic and digital technologies give us a unique window into the fundamental nature of sound. Technology has an ability to reveal truths about the physical world that we might feel, but are difficult to capture, describe, or express.

However, we're going to start with the basics. Sound, as commonly understood, has some basic characteristics. There is a vocabulary that we use to describe sounds that you will need to get familiar with in order to get into the details of how sound is produced and represented in the digital realm.

## Sound as energy transfer

Sound as we generally experience it is a form of energy that is transfered from one place to another. Audible sound is a form of energy transmitted across space and time and perceived by your body as a kind of touch. Shall we break it down?

### Compression/Rarefaction

What happens when you clap your hands together? How does someone else in the room hear it?

Well, when you clap your hands, you are crushing the air molecules together between your hands, creating an area of high pressure. Now the air molecules were quite happy with their distance from one another, and would prefer to return to that distribution (the normal air pressure in the room), so they bounce back to where they were, but maybe overshoot a little, disturbing other air molecules and creating another area of **compression**. Those molecules likewise bounce away and disturb other molecules. In between the areas of compression, the air molecules spread out, forming an area of **rarefaction**. Imagine you're on a crowded train, and someone gets shoved on one end of the car. It's kind of like that.

### Wave propagation

Sound travels through a medium. Mostly we think of air as the medium in which a sound travels, but it travels pretty well through water and even solid objects. How?

When something disturbs the air molecules, like a hand clap, the process of compressin and rarefaction creates a **pressure wave** radiating out in all directions from the original source.

When that pressure wave eventually reaches someone's ear, a tiny membrane (the ear drum) vibrates in response to the air pressure wave. This vibration is picked up by the auditory nerve and the listener perceives that pressure wave as sound.

It takes time for the sound wave to get from one place to another. The rate at which sound waves travel through a medium is determined mainly by its density. The **speed of sound** in air is generally 343 meters per second (at 20 °C (68 °F), low humidity) or 767 mph. That's pretty fast, but a loud sound a mile away would still take 4.69 seconds to reach your ears. In large concert venues, sound engineers have to take these delays into account when setting up speaker arrays.

## Frequency/Pitch

Certain sounds are made up of continuous vibration of air molecules. Our hand clap example could be considered an "impulse" type sound - a sudden "transient" noise with no sustained vibration. It's a momentary spike in air pressure that you perceive as a short, sharp "pop."

A violin, on the other hand, creates sound mainly by drawing a bow across a string. The bow applies friction to the string, causing it to vibrate, or **oscillate**, back and forth rapidly, hundreds of times per second. When it does so, it creates a regular series of pressure waves evenly distributed in time and space. We can measure the frequency of those vibrations, and we perceive that frequency as a pitch. If that violin is playing a note with a frequency of 440 vibrations per second (440 Hertz or Hz), it would match the pitch 'A' above middle 'C' on the piano.

## Period/Cycle/Wavelength/Phase

We call a wave that repeats at regular intervals a "periodic" wave because we can graph its pattern of compressions and rarefactions as a regular cycle, or period. 

A **cycle** is one complete oscillation of a wave, from equillibrium, to full compession, to full rarefaction, and back to equillibrium. 

The **period** of a wave is the amount of time it takes to complete one cycle. Period (cycle duration in milliseconds) and frequency (vibrations per second) are *inversely* related: 
    
**frequency (Hz) = 1 / period (seconds)**

> 50 Hz = 1 / 0.02 seconds (20 ms)<br>
> 100 Hz = 1 / 0.01 soconds (10 ms)<br>
> 440 Hz = 1 / 0.0023 seconds (2.3 ms)

**Wavelength** is the physical distance one cycle of a wave would take up in the air. It's the distance between peaks (areas of compression), and it is related to both the frequency and the speed of sound. 

To calculate wavelength, use the formula **λ = v/f**, where λ (lambda) is the wavelength, v is the wave's speed, and f is the frequency. For that violin note, A @ 440 Hz, we could simply divide 343/440 to get 0.7795 meters (or 767/440 to get 1.74 feet). 

Wavelength is especially important for acoustical engineering - trying to make a space sound good, based on its shape, dimensions, and resulting resonances. You can use that formula to calculate **room resonances** (possible problem tones that might cause feedback or "boominess" in the sound of a room because they fit evenly in the space and therefore amplify themselves as they reflect off the walls!). For instance, a room with two parallel walls ten feet apart would have a resonance tone (or **"mode"**) at (10 = 767/f = 76.7 Hz), but the lowest resonance is actually half that frequency, or 38.35 Hz. However, every integer multiple of that lowest frequency (its "harmonics" or "overtones") will also resonate, so your acoustic treatment has to account for frequencies of 38.35 Hz, 76.7 Hz, 115.05 Hz, 153.4 Hz, 191.75 Hz, 230.1 Hz, 268.45 Hz, and so on. Those bass frequencies are the hardest to treat with acoustical panels, but they are the most important for making sound intelligible in a listening space.

## Amplitude/Loudness

When a sound wave travels through the air, molecules are **displaced** from their equillibrium, or resting point and then return to equillibrium as the sound dissipates. As we have discussed, the frequency of air displacement, or oscillation, determines its apparent pitch. But the *amount* of displacement is what determines its **volume**. This is measured as intensity of the sound (the maximum displacement of air molecules in a sound wave). Imagine quiet sounds as tiny ripples and loud sounds as towering surf.

The amplitude of a wave is generally correlated to its **perceived loudness**, but the reality of how we perceive loudness is complex. We often measure loudness in decibels (dB) which is a *ratio* of two numbers, scaled logarithmically. When we talk about the volume level of a sound in space, we are talking about "sound pressure levels" in numerical terms that correlate to human comfort. Listening to music at 85dB (SPL) is pretty loud, but tolerable for quite some time. 70 dB would be normal converastion level. Anything over 96 dB gets uncomfortable, and 120 dB is the threshold of pain. It's not unlike the Fahrenheit scale for temperature.

Different decibel scales are used for different applications. A decibel measurement is *always* a comparison against a standard reference point

>dBSPL,Sound Pressure Level (acoustic sound in the air, the reference point is 20 micro-Pascals)<br> 
dBFS, Full Scale (in a digital audio system, the reference is 0, all sound measurements are negative values)<br>
dBV, Volt (used in analog audio equipment. 0 dB is 1 Volt)<br>
dBu, Unloaded (used in analog audio equipment. 0 dB is 0.775 Volts)<br>
dBm, Milliwatts (used in radio and microwave communication, refenced to 1 milliwatt)

## Timbre

So far we have talked about pitched sounds in terms of a single frequency, but most pitched sounds you will hear have a more complex blend of frequencies. For instance, a violin tone at 440 Hz also contains frequency energy at 880 hz, 1760 Hz, 3520 Hz, and so on. These "overtones" are present in the sound, but not as prominent as the lowest, or "fundamental," tone. They blend together to give the violin it's unique *timbre*, or "tone color."

The frequencies that make up the overtones of most pitched instruments are integer multiples of the fundamental frequency. In that way they are said to be "harmonically" related. So we talk about the overtone series and the harmonics of a note more or less interchangably.

Why are overtones usually harmonically related to the fundamental frequency? Well, imagine a string, attached to the instrument at both ends ("nodes"). Pluck that string and it oscillates back and forth with a wavelength that is twice its length (from one node to another is half a wave). But that string can also simultaneously vibrate at the next available mode (just like a room resonance), which is exactly twice the fundamental (a node at each end and in the middle). Likewise, it resonates at the next mode (1/3 the wavelength or 3 times the fundamental), and the next (1/4 λ or 4 * *f*), and so on.

Wind instruments operate in a similar fashion, but the tubes that make up their bodies act as resonating air chambers (like a room). Therefore, wind and brass instruments have timbres that also rely on the harmonic series in varying combinations. The human singing voice works on the same basic principle (your head and mouth are the resonators).

The exception is generally in the world of metallic percussion, such as bells and cymbals, in which many unrelated frequencies may resonate simultaneously. The term for this kind of timbre is "inharmonicity" since the different modes are not simple multiples of a clear fundamental frequency.


