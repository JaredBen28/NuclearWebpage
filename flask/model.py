# Libary Importations
import numpy as np
import simpy
import math
import time

sampleRate = 0

def step(magnitude, time, delay, initial):
    if time > delay:
        x = magnitude
    else:
        x = initial  
    return x

# Point Kinematic Equations 
beta = 0.0067
beta1 = 2.432e-4
beta2 = 1.3632e-3
beta3 = 1.2032e-03
beta4 = 2.6048e-03
beta5 = 8.192e-4
beta6 = 1.664e-4

lam1 = 0.0127
lam2 = 0.0317
lam3 = 0.115
lam4 = 0.311
lam5 = 1.40
lam6 = 3.87

MPT = 0.0001 # seconds mean prompt time


# Core parameter Models
Lfuel = 7.9
N = 18216
Nassembly = 69
Ntotal = 19941
Nfuel = 18216
ODbarrel = 6.701
ODclad = 0.0312
ODpellet = 0.0269
density_coolant = 44.01
density_UO2 = 658.2
Passembly = 0.705
Pfuel = 0.0413

fuel_mass = 53850.5
mass_core = 6898.3 
Afc = 14120.6
Afc1 = 7060.3
Afc2 = 7060.3
cpc = 1.376
cpf = 0.059
f = 0.97
mc1 = 3449.1
mc2 = 3449.1
Tf = 962.672
Tfo = 962.741
Ufc = 0.0909
Wc = 8333.3


# Nominal Temps (Farenheit)
theta1o = 586.3
theta2o = 608.0
Tfo = 608.0

# Nominal Power 
Po = 502343
no = 3500

# reactivity coeffs
ac = -0.0002
af = -0.165e-05

# Controller Parameters
K = 1
Kp = 0.3
Ki = 0.01
alpha = 0.01


# Coeffiecents of the OTSG 
Kb = -0.000053
K1 = 8.02299324e-04
Ksc = -0.000053

# Steam Generator Design Parameters
As = 13.18
Awsc = 2247.22

# heat capacities
cpfw = 1.122
cpp = 1.37661
cpsc = 1.128
cpw = 0.109
cps = 0.762

# Diameters
Dit = 4.642e-02
Dot = 5.208e-02
Dis = 3.5
Dos = 6.84

# heat transfer
hfg = 664.9
hpw = 1.807
hwb = 2.16647
hws = 0.6672
hwsc = 1.18

# densities
pb = 45.14
pf = 45.138
pfw = 53.47
pp = 44.75
ps = 1.15358
psc = 50.76
pw = 526

# Lengths
L = 28
Lb = 19.9302
Ls = 3.85776
Lsc = 4.21202

Mstm = 18
N = 6446
R = 10.71316

# Flow Rates
Wp = 8333.33
Ws = 504.059
Wfw = 504.059

Zss = 0.8313

# Secondary Side
Tsat = 599.079
Tfw = 250

cpw = 2.4
hws = 12
hwb = 12
hwsc = 12

ts = 1
Wso = 504.058
Pset = 825
Ps = 825
Cst = 10
kc = 5



def xprime(env, interval):
    while True:
        global xCurrent
       
        c1 = open("coolantPump.txt", "r")
        coolantPump = float(c1.read())

        c2 = open("steamDemand.txt", "r")
        steamDemand = float(c2.read())
       
        c3 = open('feedwaterPump.txt', "r")
        feedwaterPump = float(c3.read())
                
        #assigning their states to a columns in the matrix 
        t = env.now
        
        n = xCurrent[0]
        C1 = xCurrent[1]
        C2 = xCurrent[2]
        C3 = xCurrent[3]
        C4 = xCurrent[4]
        C5 = xCurrent[5]
        C6 = xCurrent[6]
        k = xCurrent[7]
        Tfuel = xCurrent[8] #going into the Steam Generator, Hot Leg 
        theta1 = xCurrent[9]
        theta2 = xCurrent[10]

        Tp1 = xCurrent[11]
        Tp2 = xCurrent[12]
        Tp3 = xCurrent[13]
        Tp4 = xCurrent[14]
        Tp5 = xCurrent[15]
        Tp6 = xCurrent[16] # going into Nuclear reactor, Cold Leg
        Tw1 = xCurrent[17]
        Tw2 = xCurrent[18]
        Tw3 = xCurrent[19]
        Tw4 = xCurrent[20]
        Tw5 = xCurrent[21]
        Tw6 = xCurrent[22]
        Ts1 = xCurrent[23]
        Ts2 = xCurrent[24]
        Tsc = xCurrent[25]


        Torque = xCurrent[26]
        Power = xCurrent[27]
        Win = xCurrent[28]
        Vp = xCurrent[29]

        A_pw1 = (N*(math.pi)*Dit*0.5*Ls)
        M_p1 = (N*math.pi*(Dit**2)*0.125*Ls*pp)
        A_ws1 = N*math.pi*Dot*0.5*Ls
        M_w1 = (N*math.pi*((Dot**2)-(Dit**2))*0.125*Ls*pw)


        rho = af*Tfuel + ac*0.5*((theta1+theta2) - (theta1o + theta2o))
        thetaAvg = (theta1 + theta2)/2
        Tavgo = 547 
        Tinlet = 500

        f = 0.97
        Wc = coolantPump
        Tfuelo = 608
   
        rho_c = Kp*(Tavgo - thetaAvg) + Ki*(k)
        rho = af*(Tfuel - Tfuelo) + 0.5*ac*(theta1 - theta1o) + 0.5*ac*(theta2 - theta2o) + rho_c

        dndt =  (rho/MPT) - (beta/MPT)*n + C1*lam1 + C2*lam2 + C3*lam3 + C4*lam4 + C5*lam5 + C6*lam6
        dc1dt = (beta1/MPT)*(n) - lam1*C1
        dc2dt = (beta2/MPT)*(n) - lam2*C2
        dc3dt = (beta3/MPT)*(n) - lam3*C3
        dc4dt = (beta4/MPT)*(n) - lam4*C4
        dc5dt = (beta5/MPT)*(n) - lam5*C5
        dc6dt = (beta6/MPT)*(n) - lam6*C6
        dkdt = Tavgo - thetaAvg


        dTfuel = (f*no*n + (Ufc*Afc)*(Tfuel - thetaAvg))/(fuel_mass*cpf)
        dtheta1 = (Wc*cpc*(Tinlet - theta1) + ((Ufc*Afc)/2)*(Tfuel - theta1) + (1-f)*no*n)/(mc1*cpc)
        dtheta2 = (Wc*cpc*(theta1 - theta2) + ((Ufc*Afc)/2)*(Tfuel - theta1) + (1-f)*no*n)/(mc2*cpc)
        
        dLsc = 0.2
        dLs = 0.2
        Vref = 10
        tp = 2

        # Flow Rates
        #Ws = step(504, t, 2 , 504)
        Ws = steamDemand

        dWin = (-1/tp)*(Win) + Vp ;
        dVp = (-1/tp)*(Vp) + (Vref)
        Wfw = (dWin)/(69.73-72.69)

        W12 = Ws - 0.5*dLs*As*ps
        Wb = W12 - 0.5*dLs*As*ps
        Wdb = Wb - dLsc*As*pb
        Wsc = Wdb - 0.5*dLsc*As*psc
        #Wfw = Wsc - 0.5*dLsc*As*psc

        #Turbine 
        speed = 1800 #rpm
        Power = speed*Torque
        dTq = (-1/10)*Torque + (1/10)*Ws*(2748)

        #Condensor
        Qdot = Ws*(69.73-981.6)


        '''Once Through Steam Generator Model '''

        # Primary Side
        dTp1 = (Wp*cpp*(theta2 - Tp1) - hpw*A_pw1*(Tp1 - Tw1))/(M_p1*cpp)
        dTp2 = (Wp*cpp*(Tp1 - Tp2) - hpw*A_pw1*(Tp2 - Tw2))/(M_p1*cpp)
        dTp3 = (Wp*cpp*(Tp2 - Tp3) - hpw*A_pw1*(Tp3 -Tw3))/(M_p1*cpp)
        dTp4 = (Wp*cpp*(Tp3 - Tp4) - hpw*A_pw1*(Tp4 -Tw4))/(M_p1*cpp)
        dTp5 = (Wp*cpp*(Tp4 - Tp5) - hpw*A_pw1*(Tp5 -Tw5))/(M_p1*cpp)
        dTp6 = (Wp*cpp*(Tp5 - Tp6) - hpw*A_pw1*(Tp6 -Tw6))/(M_p1*cpp)
        
        # Wall Temps
        dTw1 = (hpw*A_pw1*(Tp1 - Tw1) - hws*A_ws1*(Tw1 - Ts1))/(M_w1*cpw)
        dTw2 = (hpw*A_pw1*(Tp2 - Tw2) - hws*A_ws1*(Tw2 - Ts2))/(M_w1*cpw)
        dTw3 = (hpw*A_pw1*(Tp3 -Tw3) - hws*A_ws1*(Tw3 -Tsat))/(M_w1*cpw)
        dTw4 = (hpw*A_pw1*(Tp4 -Tw4) - hws*A_ws1*(Tw4 -Tsat))/(M_w1*cpw)
        dTw5 = (hpw*A_pw1*(Tp5 -Tw5) - hws*A_ws1*(Tw5 -Tsc))/(M_w1*cpw)
        dTw6 = (hpw*A_pw1*(Tp6 -Tw6) - hws*A_ws1*(Tw6 -Tsc))/(M_w1*cpw)
        
        dPS = (Zss*(Wb - Ws)*R*((Ts1+458.67+Ts2+458.67)/(2*Mstm)))/(As*Ls)
        dWs = (Wso*(1 - Cst*(kc*(1-(Ps/Pset))+((kc*(1-Ps/Pset))/ts)))-Ws)/ts
        dPsc = (Wfw - Wdb - psc*As*dLsc)/(As*Ls*Ksc)

        # Secondary Side
        dTsc = (hwsc*(math.pi)*Dot*0.5*Lsc*(Tw1-Tfw) + cpsc*(Wfw*Tfw - Wsc*Tsc) + (1/778)*0.5*As*Lsc*dPsc - 0.5*Tfw*dLsc*As*psc*cpsc)/((0.5*Lsc*As*psc*cpsc))
        dTs1 = (hws*A_ws1*(Tw1 - Ts1) - (Ws*cps*(Ts2 - Ts1)))/(As*0.5*Ls*ps*cps)
        dTs2 = (hws*A_ws1*(Tw2 - Ts2) - (Ws*cps*(Tsat - Ts2)))/(As*0.5*Ls*ps*cps)

        # Differential Matrix
        xPrime = [dndt, dc1dt, dc2dt, dc3dt, dc4dt, dc5dt, dc6dt, dkdt, dTfuel, dtheta1, dtheta2, dTp1, dTp2, dTp3, dTp4, dTp5, dTp6,dTw1, dTw2, dTw3, dTw4, dTw5, dTw6, dTs1, dTs2, dTsc, dTq, Power, dWin, dVp]


        xMid = [    xCurrent[0] + interval * xPrime[0],
                    xCurrent[1] + interval * xPrime[1],
                    xCurrent[2] + interval * xPrime[2],
                    xCurrent[3] + interval * xPrime[3],
                    xCurrent[4] + interval * xPrime[4],
                    xCurrent[5] + interval * xPrime[5],
                    xCurrent[6] + interval * xPrime[6],
                    xCurrent[7] + interval * xPrime[7],
                    xCurrent[8] + interval * xPrime[8],
                    xCurrent[9] + interval * xPrime[9],
                    xCurrent[10] + interval * xPrime[10],
                    xCurrent[11] + interval * xPrime[11],
                    xCurrent[12] + interval * xPrime[12],
                    xCurrent[13] + interval * xPrime[13],
                    xCurrent[14] + interval * xPrime[14],
                    xCurrent[15] + interval * xPrime[15],
                    xCurrent[16] + interval * xPrime[16],
                    xCurrent[17] + interval * xPrime[17],
                    xCurrent[18] + interval * xPrime[18],
                    xCurrent[19] + interval * xPrime[19],                                    
                    xCurrent[20] + interval * xPrime[20],
                    xCurrent[21] + interval * xPrime[21],
                    xCurrent[22] + interval * xPrime[22],
                    xCurrent[23] + interval * xPrime[23],
                    xCurrent[24] + interval * xPrime[24],
                    xCurrent[25] + interval * xPrime[25],
                    xCurrent[26] + interval * xPrime[26],
                    xCurrent[27]/1e6, 
                    xCurrent[28] + interval * xPrime[28],
                    xCurrent[29] + interval * xPrime[29]
                ]
        xCurrent = xMid

        global sampleRate
        if sampleRate <= 200:
            sampleRate += 1  
        else:
            sampleRate = 0            
            sample = np.array(xCurrent)
            sample = np.append(sample, int(time.time_ns()))
            sample.tofile('sample.csv', sep=",")
        yield env.timeout(interval) 
        

if __name__ == '__main__':
    # os.remove('sample.csv')
    #xPrime = [dndt, dc1dt, dc2dt, dc3dt, dc4dt, dc5dt, dc6dt, dkdt, dTfuel,dtheta1, dtheta2, dTin, Pth, dTp1, dTp2, dTp3, dTp4, dTp5, dTp6,dTw1, dTw2, dTw3, dTw4, dTw5, dTw6, dTs1, dTs2, dTsc, dTq, Power, dWin, dVp]
    xCurrent = [1, beta1/lam1, beta2/lam2, beta3/lam3, beta4/lam4, beta5/lam5, beta6/lam6, 0, 500,500,550,Po,600,600,600,600,600,600,550,550,550,550,550,550,400,400,400,1000,0,30,0,0,0,0,0,0]
    env = simpy.rt.RealtimeEnvironment(strict=False)
    proc = env.process(xprime(env,0.001))
    
    env.run(until=proc)