import Phaser from 'phaser';

import { key } from '../constants';

enum Animation {
  Left = 'Left',
  Right = 'Right',
  Up = 'Up',
  Down = 'Down',
}

enum Direction {
  Left = 'Left',
  Right = 'Right',
  Up = 'Up',
  Down = 'Down',
}

const directions = [
  Direction.Left,
  Direction.Right,
  Direction.Up,
  Direction.Down,
];

const Velocity = {
  Horizontal: 175,
  Vertical: 175,
} as const;

export class Cat extends Phaser.Physics.Arcade.Sprite {
  body!: Phaser.Physics.Arcade.Body;
  selector: Phaser.Physics.Arcade.StaticBody;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture = key.atlas.cat,
    frame = 'misa-front',
  ) {
    super(scene, x, y, texture, frame);

    // Add the sprite to the scene
    scene.add.existing(this);

    // Enable physics for the sprite
    scene.physics.world.enable(this);

    // The image has a bit of whitespace so use setSize and
    // setOffset to control the size of the player's body
    this.setSize(32, 42).setOffset(0, 22);

    // Collide the sprite body with the world boundary
    this.setCollideWorldBounds(true);

    // Create sprite animations
    this.createAnimations();

    // Add selector
    this.selector = scene.physics.add.staticBody(x - 8, y + 32, 16, 16);
  }

  private createAnimations() {
    const anims = this.scene.anims;

    // Create left animation
    if (!anims.exists(Animation.Left)) {
      anims.create({
        key: Animation.Left,
        frames: anims.generateFrameNames(key.atlas.player, {
          prefix: 'misa-left-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Create right animation
    if (!anims.exists(Animation.Right)) {
      anims.create({
        key: Animation.Right,
        frames: anims.generateFrameNames(key.atlas.player, {
          prefix: 'misa-right-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Create up animation
    if (!anims.exists(Animation.Up)) {
      anims.create({
        key: Animation.Up,
        frames: anims.generateFrameNames(key.atlas.player, {
          prefix: 'misa-back-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Create down animation
    if (!anims.exists(Animation.Down)) {
      anims.create({
        key: Animation.Down,
        frames: anims.generateFrameNames(key.atlas.player, {
          prefix: 'misa-front-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  update() {
    const { anims, body, selector } = this;
    const prevVelocity = body.velocity.clone();

    // Stop any previous movement from the last frame
    body.setVelocity(0);

    const direction = Phaser.Utils.Array.GetRandom(directions);

    // Horizontal movement
    switch (true) {
      case direction === Direction.Left:
        body.setVelocityX(-Velocity.Horizontal);
        selector.x = body.x - 19;
        selector.y = body.y + 14;
        break;

      case direction === Direction.Right:
        body.setVelocityX(Velocity.Horizontal);
        selector.x = body.x + 35;
        selector.y = body.y + 14;
        break;
    }

    // Vertical movement
    switch (true) {
      case direction === Direction.Down:
        body.setVelocityY(-Velocity.Vertical);
        selector.x = body.x + 8;
        selector.y = body.y - 18;
        break;

      case direction === Direction.Up:
        body.setVelocityY(Velocity.Vertical);
        selector.x = body.x + 8;
        selector.y = body.y + 46;
        break;
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    body.velocity.normalize().scale(Velocity.Horizontal);

    anims.stop();

    // If we were moving, pick an idle frame to use
    switch (true) {
      case prevVelocity.x < 0:
        this.setTexture(key.atlas.player, 'misa-left');
        break;
      case prevVelocity.x > 0:
        this.setTexture(key.atlas.player, 'misa-right');
        break;
      case prevVelocity.y < 0:
        this.setTexture(key.atlas.player, 'misa-back');
        break;
      case prevVelocity.y > 0:
        this.setTexture(key.atlas.player, 'misa-front');
        break;
    }
  }
}
